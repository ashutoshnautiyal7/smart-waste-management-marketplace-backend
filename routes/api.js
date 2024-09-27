import { Router } from "express";
import AuthController from "../controllers/user/AuthController.js";
import PostController from "../controllers/post/PostController.js";
import authMiddleware from "../middleware/Authenticate.js";

import ProfileController from "../controllers/user/ProfileController.js";

const router = Router();

//authentication  
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)

// post 
router.post('/createpost', PostController.createPost)
router.put('/updatepost', PostController.updatePost)
router.delete('/deletepost', PostController.deletePost)
router.get('/posts', PostController.getAllPosts)


// like and comment
router.post('/likepost', PostController.likePost)
router.post('/comment', PostController.createComment)
router.delete('/deletecomment', PostController.deleteComment)

// // community forms 
// router.post('/postform', FormController.postFormData);
// router.get('/getformdata', FormController.getFormData);


router.get('/profile', authMiddleware, ProfileController.index) // private route 
router.put('/update-profile', authMiddleware, ProfileController.update) // private route 
router.get('/postsforuser', PostController.getAllPostsForUser)


// // for updating the subscription fields 
// router.put('/gen-update', ProfileController.generalUpdate)  

// // forgot pass 
// router.post('/forget-pass', AuthController.forgetPass)
// router.post('/reset-pass/:token', AuthController.resetPass)

// UPDATE PASSWORD 
// router.post('/update-pass', authMiddleware, AuthController.updatePassword)





export default router; 