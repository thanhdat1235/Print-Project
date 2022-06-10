const Contact = require("../../model/contact");
const statusAPI = require("../../utils/statusAPI");

class ContactController {
  async create(req, res) {
    const { name, phonenumber, demand } = req.body;
    try {
      const contact = await Contact.create({
        name,
        phonenumber,
        demand,
        created_at: new Date(),
      });
      return res.status(statusAPI.CREATED.code).json(contact);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteContact(req, res) {
    try {
      const ids = req.body;
      await Contact.remove({ _id: { $in: ids } });
      res
        .status(statusAPI.OK.code)
        .send({ message: "Delete Contact Successfully" });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ContactController();
