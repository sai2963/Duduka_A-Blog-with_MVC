const { ObjectId } = require("mongodb");
const db = require("../data/database");
class Blog {
  constructor(username, title, image, content, id) {
    this.username = username;
    this.title = title;
    this.image = image;
    this.content = content;
    if(id){
      this.id = new ObjectId(id);
    }
    
  }
    static async fetchAll(){
      const data =  await db.getDb().collection("blogdata").find().toArray();
      return data;
    } 
    
    static async fetchById(blogId) {
      const blog = await db.getDb().collection("blogdata").findOne({ _id: new ObjectId(blogId) });
      return blog;
    }
  

  async save() {
    const Blogdata = {
      username: this.username,
      title: this.title,
      image: this.image.path,
      content: this.content,
    };
    const result = await db.getDb().collection("blogdata").insertOne(Blogdata);
    return result;
  }
}
module.exports = Blog;
