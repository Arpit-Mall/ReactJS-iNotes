const express = require("express");
const NoteSchema = require("../models/NotesSchema");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Get All the Notes using: GET "/api/notes/getuser". Login required
router.get("/fetchallnotes", fetchUser, async (req,res) => {
    // console.log(req.user);
    try
        {
            const notes = await NoteSchema.find({user:req.user.id});
            res.send(notes);
        } 
    catch (error) 
        {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    
}); 

// ROUTE 2: Add a new Notes using: POST "/api/notes/addnote". Login required
router.post("/addnote", fetchUser, [
    body("title", "Title must be atleast 3 characters").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({ min: 5 }),
], async (req,res) => {
    try 
        {
            const {title, description, tag} = req.body;

            // If there are errors, return Bad request and the errors
            const error = validationResult(req);
            if (!error.isEmpty()) 
                {
                    return res.status(400).json({ error: error.array() });
                }
            
            const note = new NoteSchema({title,description,tag,user:req.user.id});
            const savedNote = await note.save();
            res.send(savedNote);
        } 
    catch (error) 
        {
            console.error(error.message);
            res.status(500).send("Internal Server Error"); 
        }
}); 

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote". Login required
router.put("/updatenote/:id", fetchUser, [
    body("title", "Title must be atleast 3 characters").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({ min: 5 }),
], async (req,res) => {

    try 
        {
            const {title, description, tag} = req.body;
            
            // Create a newNote object
            const newNote = {};
            if(title){newNote.title=title};
            if(description){newNote.description=description};
            if(tag){newNote.tag=tag};

            // Find the note to be updated and update it
            let note = await NoteSchema.findById(req.params.id);
            // console.log(note);
            if(!note){return res.status(404).send("Not Found")};
            
            // Allow updation only if user owns this Note
            if(note.user.toString()!==req.user.id)
                {
                    return res.status(401).send("Not Allowed");
                }
            
            note = await NoteSchema.findByIdAndUpdate(req.params.id, newNote, {new:true});
            res.json(note);
        } 
    catch (error) 
        {
            console.error(error.message);
            res.status(500).send("Internal Server Error"); 
        }

});

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete("/deletenote/:id",fetchUser,async (req,res) => {
    try 
        {
            // Find the note to be delete and delete it
            let note = await NoteSchema.findById(req.params.id);
            // console.log(note);
            if(!note){return res.status(404).send("Not Found")};
            
            // Allow deletion only if user owns this Note
            if(note.user.toString()!==req.user.id)
                {
                    return res.status(401).send("Not Allowed");
                }
            
            note = await NoteSchema.findByIdAndDelete(req.params.id);
            res.json({Success:"Note has been Deleted",note});
        } 
    catch (error) 
        {
            console.error(error.message);
            res.status(500).send("Internal Server Error"); 
        }

})



module.exports = router;