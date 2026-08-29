import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import bcrypt from "bcryptjs";
import { deleteOldImage, uploadImage } from "../utils/uploadImage.js";
import verifySession from "../middleware/verifySession.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";
import { passwordComplexity } from "./auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get users based on role
router.get("/", verifySession, async (req, res) => {
  try {
    const userRole = req.session?.user?.role;
    const userTeamId = req.session?.user?.team?.id;
    if (userRole === "Super Admin" || !userTeamId) {
      // Super Admin sees all users
      const userList = await prisma.users.findMany({
        include: { team: { select: { id: true, name: true } } },
      });
      return res.status(200).json({ success: true, data: userList });
    } else {
      // Regular user sees only users in their team
      const users = await prisma.users.findMany({
        where: { teamId: Number(userTeamId) },
        include: { team: { select: { id: true, name: true } } },
      });
      return res.status(200).json({ success: true, data: users });
    }
  } catch (err) {
    logger.error("Error fetching users:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post(
  "/",
  requireSuperAdmin,
  uploadImage("user").fields([
    { name: "profileImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const profileImage = req.files?.profileImage?.[0]?.filename || null;
      const bannerImage = req.files?.bannerImage?.[0]?.filename || null;
      const { name, email, password, role, teamId, isActive, mobile } = req.body;
      const parsedIsActive = isActive === "true" || isActive === true;

      if (!name || !email || !password || !role || !mobile) {
        return res.status(400).send({
          success: false,
          message: "Name, email, password, role and mobile are required",
        });
      }

      const passwordCheck = passwordComplexity.safeParse(password);
      if (!passwordCheck.success) {
        return res.status(400).send({
          success: false,
          message: passwordCheck.error.issues[0].message,
        });
      }

      if (mobile && !/^\+?[0-9]{10,15}$/.test(mobile.replace(/\s/g, ''))) {
        return res.status(400).send({ success: false, message: "Invalid mobile number. Must be 10-15 digits." });
      }

      const hasPassword = bcrypt.hashSync(password, 10);

      const existUser = await prisma.users.findFirst({ where: { email } });
      if (existUser) {
        return res.status(409).send({
          success: false,
          message: `${existUser.email} already exists`,
        });
      }

      const newUserInfo = await prisma.users.create({
        data: {
          name,
          email,
          mobile,
          role,
          hasPassword,
          isActive: isActive !== undefined ? parsedIsActive : true,
          ...(teamId && { team: { connect: { id: Number(teamId) } } }),
          ...(profileImage && { profileImage }),
          ...(bannerImage && { bannerImage }),
        },
      });

      return res.status(201).send({
        success: true,
        message: `${newUserInfo.name} created successfully`,
      });
    } catch (err) {
      logger.error("Error creating user:", { error: err.message, stack: err.stack });
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

// Update user
router.put(
  "/:id",
  requireSuperAdmin,
  uploadImage("user").fields([
    { name: "profileImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const profileImage = req.files?.profileImage?.[0]?.filename || null;
      const bannerImage = req.files?.bannerImage?.[0]?.filename || null;
      const { id } = req.params;
      const { password, isActive, teamId } = req.body;
      const allowedFields = {};
      if (req.body.name !== undefined) allowedFields.name = req.body.name;
      if (req.body.email !== undefined) allowedFields.email = req.body.email;
      if (req.body.mobile !== undefined) allowedFields.mobile = req.body.mobile;
      if (req.body.role !== undefined) allowedFields.role = req.body.role;
      if (isActive !== undefined) {
        allowedFields.isActive = isActive === "true" || isActive === true;
      }

      if (allowedFields.mobile && !/^\+?[0-9]{10,15}$/.test(allowedFields.mobile.replace(/\s/g, ''))) {
        return res.status(400).send({ success: false, message: "Invalid mobile number. Must be 10-15 digits." });
      }

      if (!Number(id)) {
        return res.status(400).send({
          success: false,
          message: "Valid user ID is required",
        });
      }

      const existUser = await prisma.users.findUnique({ where: { id: Number(id) } });
      if (!existUser) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      let hasPassword = existUser.hasPassword;
      if (password) {
        const passwordCheck = passwordComplexity.safeParse(password);
        if (!passwordCheck.success) {
          return res.status(400).send({ success: false, message: passwordCheck.error.issues[0].message });
        }
        hasPassword = bcrypt.hashSync(password, 10);
      }

      if (existUser.profileImage && profileImage) {
        deleteOldImage(existUser.profileImage);
      }
      if (existUser.bannerImage && bannerImage) {
        deleteOldImage(existUser.bannerImage);
      }

      const updateInfo = await prisma.users.update({
        where: { id: Number(id) },
        data: {
          ...allowedFields,
          ...(profileImage && { profileImage }),
          ...(bannerImage && { bannerImage }),
          ...(teamId !== undefined && {
            team: teamId ? { connect: { id: Number(teamId) } } : { disconnect: true },
          }),
          hasPassword,
        },
      });

      return res.status(200).send({
        success: true,
        message: `${updateInfo.name}, data updated successfully`,
        info: updateInfo,
      });
    } catch (err) {
      logger.error("Error updating user:", { error: err.message, stack: err.stack });
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default router;