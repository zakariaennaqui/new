import jwt from 'jsonwebtoken';

//
const authAdmin = async (req, res, next)=>{
    try {
        //get the token from the request header
        const {atoken} = req.headers;
        if(!atoken){
            return res.json({success:false, message:"Not authorized, Login again"});
        }

        //verify the token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success:false, message:"You are not authorized to access this route"});
        }
        //
        next();
    } catch (error) {
        console.log(error);
        return res.json({success:false, message:error.message});
    }
}
export default authAdmin ;