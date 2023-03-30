const User = require("../models/user_model");


const allocatedAmount=async(req,res)=>{
    try {
           const userId = req.params.user_Id;
           const {amount}=req.body;
           if(!userId||!amount)
            throw new Error("All field require!!")
           
            const user = await User.findById({_id:userId});
            if(!user)
            throw new Error("User not found");
            user.allocatedAmount=amount;
            await user.save();

            res.status(201).json({
                 user,
                success:true,
                message:"Alloated amount set successfully"
            })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        }
        )
    }
}

const locekdAmount=async(req,res)=>{
    try {
           const userId = req.params.user_Id;
           const {amount}=req.body;
           if(!userId||!amount)
            throw new Error("All field require!!")
           
            const user = await User.findById({_id:userId});
            if(!user)
            throw new Error("User not found");
            if(user.locekdAmount>allocatedAmount)
            throw new Error("Locked amount can't grater than allocatedAmount ");
            user.locekdAmount=amount;
            user.available_to_withdraw=user.allocatedAmount-amount
            await user.save();

            res.status(201).json({
                user,
                success:true,
                message:"Locked amount set successfully"
            })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        }
        )
    }
}

const getAllUser= async(req,res)=>{
    try {
         const user = await User.find({}).populate('bank_details').exec();;
         res.status(201).json({
            success:true,
            user
         })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getUser= async(req,res)=>{
    try {
        const userid=req.params.user_Id
         const user = await User.findById({_id:userid}).populate('bank_details').exec();
         res.status(201).json({
            success:true,
            user
         })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const getWithdraw_request=async(req,res)=>{
    try {
         let users = await User.find({});
 
         users=users.filter(user=>user.withdraw_request.length!=0);

         res.status(201).json({
            success:true,
            users
         })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

const changeStatus=async(req,res)=>{
    try {
           const userId = req.params.user_Id;
           if(!userId)
            throw new Error("User id not found!!")
           
            const user = await User.findById({_id:userId});
            if(!user)
            throw new Error("User not found");
            //if withdraw request not found
            if(user.withdraw_request.length==0)
               {
                return res.status(401).json({
                    success:false,
                    message:"Withdraw request not found"
                })
               }
             
               if(user.withdraw_request[0].state==="Credited to the beneficiary")
               {
                return res.status(201).json({
                    success:false,
                    message:"Already Credited to the beneficiary"
                })
               }   
            //change status;
            
           let status= user.withdraw_request[0].state=="processing"?"Processed":"Credited to the beneficiary" 
           user.withdraw_request[0].state=status;
           if(status!="Processed"){
            user.deposite_amount=[{amount:user.withdraw_request[0].amount},...user.deposite_amount];
            user.available_to_withdraw=0;
            user.withdraw_request=[];
            user.locekdAmount=0;
           }
          
           
            await user.save();

            res.status(201).json({
                user,
                success:true,
                message:"Status update successfully"
            })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        }
        )
    }
}

const block_request_change= async(req,res)=>{
    try {
        const userid=req.params.user_Id
         const user = await User.findById({_id:userid});
         user.isBlock=user.isBlock=="true"?"false":"true"
         await user.save();
         res.status(201).json({
            success:true,
            user
         })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports={changeStatus,allocatedAmount,locekdAmount,getAllUser,getUser
,getWithdraw_request,block_request_change}