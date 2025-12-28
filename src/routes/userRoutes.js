import { Router } from "express";

import { updateUserAvatar } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.patch(
"/users/me/avatar",
upload.single("avatar"),
updateUserAvatar
);

export default router;
