import jwt from 'jsonwebtoken';

//
const authService = async (req, res, next)=>{
    try {

        const {stoken} = req.headers
        if(!stoken){
            return res.json({success:false, message:"Not authorized, Login again"})
        }

        const token_decode = jwt.verify(stoken, process.env.JWT_SECRET)

        //req.body.docId = token_decode.id
        req.docId = token_decode.id;


        next();

    } catch (error) {
        console.log(error)
        return res.json({success:false, message:error.message})
    }
}
export default authService