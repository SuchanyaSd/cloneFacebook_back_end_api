const cloudinary = require("../config/cloudinary");
const path = require("path");
const prisma = require("../models/index");
const fs = require("fs/promises");
const createError = require("../utils/createError");

module.exports.createPost = async (req, res, next) => {
  try {
    //  // console.log(req.body)
    //  const { message } = req.body;
    //  console.log(req.file);
    //  console.log(req.user);
    //  res.json({
    //    msg: "Create post",
    //    filename: req.file.originalname,
    //    message: message,
    //    user: req.user.firstName,
    //  });

    const { message } = req.body;
    const haveFile = !!req.file;
    let uploadResult = {};
    if (haveFile) {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path);
    }
    //  console.log(uploadResult)
    const data = {
      message: message,
      image: uploadResult.secure_url || "",
      userId: req.user.id,
    };

    const rs = await prisma.post.create({ data: data });

    res.status(201).json({ msg: "Create post done", result: rs });
  } catch (err) {
    next(err);
  }
};

module.exports.getAllPost = async (req, res, next) => {
  try {
    const rs = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        like: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });
    res.json({ posts: rs });
  } catch (err) {
    next(err);
  }
};

module.exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      createError(400, "require id parameter");
    }
    const postData = await prisma.post.findUnique({ where: { id: +id } });
    console.log(postData);
    if (req.user.id !== postData.userId) {
      createError(400, "Can't Delete");
    }
    const rs = await prisma.post.delete({
      where: {
        id: +id,
      },
    });

    res.json({ msg: `Delete post id=${id} done`, deletedPost: postData });
  } catch (err) {
    next(err);
  }
};

module.exports.updatePost = async (req, res, next) => {
  try {
    const {id} = req.params
    const {message, removePic} = req.body

    const postData = await prisma.post.findUnique({ where: { id: +id } });
    if (!postData || req.user.id !== postData.userId) {
      createError(400, "Cannot edit this post")
    }

    const haveFile = !!req.file
    if (haveFile) {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path)
    }
    let data = haveFile 
    ? {message, image : uploadResult.secure_url, userId : req.user.id}
    : {message, userId : req.user.id, image : removePic ? "" : postData.image}

    const rs = await prisma.post.update({
      where : {
        id : +id,
      },
      data
    })

    res.json({ msg: "Update post" });
  } catch (err) {
    next(err);
  }
};