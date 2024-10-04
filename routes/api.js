import { Router } from "express";
import AuthController from "../controllers/user/AuthController.js";
import PostController from "../controllers/post/PostController.js";
import authMiddleware from "../middleware/Authenticate.js";


import ProfileController from "../controllers/user/ProfileController.js";
import CommunityPostController from "../controllers/communityPost/PostController.js";
import ErpController from "../controllers/epr/AuthController.js";


const router = Router();

//authentication  
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)

//authentication for company

router.post('/auth-erp/register', ErpController.register)
router.post('/auth-erp/login', ErpController.login)

// post 
router.post('/createpost', PostController.createPost)
router.put('/updatepost', PostController.updatePost)
router.delete('/deletepost', PostController.deletePost)
router.get('/posts', PostController.getAllPosts)


// community post 
router.post('/community/createpost', CommunityPostController.createPost)
router.put('/community/updatepost', CommunityPostController.updatePost)
router.delete('/community/deletepost', CommunityPostController.deletePost)
router.get('/community/posts', CommunityPostController.getAllPosts)


// like and comment
router.post('/likepost', CommunityPostController.likePost)
router.post('/comment', CommunityPostController.createComment)
router.delete('/deletecomment', CommunityPostController.deleteComment)

// // community forms 
// router.post('/postform', FormController.postFormData);
// router.get('/getformdata', FormController.getFormData);


router.get('/profile', authMiddleware, ProfileController.index) // private route 
router.put('/update-profile', authMiddleware, ProfileController.update) // private route 
router.get('/postsforuser', CommunityPostController.getAllPostsForUser)


// // for updating the subscription fields 
// router.put('/gen-update', ProfileController.generalUpdate)  

// // forgot pass 
// router.post('/forget-pass', AuthController.forgetPass)
// router.post('/reset-pass/:token', AuthController.resetPass)

// UPDATE PASSWORD 
// router.post('/update-pass', authMiddleware, AuthController.updatePassword)





export default router; 