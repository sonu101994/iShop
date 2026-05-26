const generateRandomNames=(file_name)=>{
    return new Date().getTime()+"-"+Math.floor(Math.random()*10000)+file_name;
}




const message={
    catch_error:{
        msg:"Internal server error",
        flag:0,
    },

    delete_msg:(module_name)=>{
        return{
            msg:`${module_name} deleted successfully`,
            flag:1,
        }
    },
    created_msg:(module_name)=>{
        return{
            msg:`${module_name} created successfully`,
            flag:1,
        }
    },

    general_error:(text)=>{
        return{
            msg:text,
            flag:0,
        }
    },

    general_success:(text)=>{
        return{
            msg:text,
            flag:1,
        };
    }
};


module.exports={generateRandomNames,message};