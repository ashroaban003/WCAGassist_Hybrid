const mongoose=require('mongoose');


  
  const ruleSchema = mongoose.Schema(
    {
     rule: String,
    },
    {
      timestamps: true,
    }
  );
  

  module.exports = mongoose.model("Rules", ruleSchema);

