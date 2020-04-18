'use strict'

const express = require("express");
const Word = require("../models/word");
const router = new express.Router()

// INDEX list all words with pagination
router.get('/', async (req, res) => {

    // INDEX simple way
    //     try {
    //         const words = await Word.find({}).collation({
    //             "locale": "it",
    //             "strength": 1
    //         }).sort({ clautano: 'asc' });
    //         // res.send(words)
    //         res.render("words/index", {
    //             words: words
    //         });
    //     } catch (e) {
    //         res.status(500).send(e)
    //     }
    // });

    try {
        const totale = await Word.estimatedDocumentCount();
        const perPage = 10;
        const current = (isNaN(req.query.page)) ? 0 : +req.query.page - 1; //default page to 1
        const k = (current === 0) ? 0 : 1; // if not first page (k=1) read last word of previous page for  BCD... title 

        const words = await Word.find({})
            .collation({
                "locale": "it",
                "strength": 1
            })
            .sort({ clautano: 'asc' })
            .skip((perPage * current - k))
            .limit(perPage + k)
            .exec();
        if (k == 0) { // if fist page add fake empty word for A title
            words.unshift({ clautano: " " });
        }

        res.render("words/indexPage", {
            words: words,
            page: current + 1,
            pages: Math.ceil(totale / perPage)
        });
    } catch (e) {
        console.log("ERROR!!!", e)
        res.status(500).send(e);
    }
});

// SEARCH 
router.get("/search", async (req, res) => {

    try {
        const perPage = 10;
        const position = await Word.find({ clautano: { $lte: req.query.parola } })
            .collation({ "locale": "it", "strength": 1 })
            .sort({ clautano: 1 })
            .countDocuments();
        const page = Math.trunc(position / perPage) + 1;
        res.redirect('/words/?page=' + page + "&parola=" + req.query.parola);
    } catch (e) {
        console.log("ERROR!!!", e)
        res.status(500).send(e);
    }
});

// NEW show new word form
router.get('/new/', async (req, res) => {
    res.render('words/new');
});

// SHOW information about specific word
router.get('/:id', async (req, res) => {
    try {
        const word = await Word.findById(req.params.id);
        res.render("words/show", { word });
    } catch (e) {
        res.status(401).send(e);
    }
});

// CREATE insert new word into DB
router.post('/', async (req, res) => {
    const newWord = new Word(
        req.body.word
    );
    try {
        await newWord.save()
        // res.status(201).send(newWord) //created
        res.redirect("/words/" + newWord._id)
    } catch (e) {
        res.status(400).send(e) //bad request
    }
});

// EDIT show edit word form
router.get("/:id/edit", async (req, res) => {
    try {
        const word = await Word.findById(req.params.id);
        res.render("words/edit", {
            word: word
        })
    } catch (e) {
        res.status(500).send(e);
    };

    // const _id = req.params.id
    // const editedWord = req.body
    // try {
    //     word = await Word.findByIdAndUpdate(_id, editedWord, { 'new': true, 'runValidators': true })
    //     if (!word) {
    //         return res.status(404).send()
    //     }
    //     return res.send(word)
    // } catch (e) {
    //     res.status(400).send(e)
    // }

});

// UPDATE worde and redirect to index
router.put("/:id", async (req, res) => {
    try {
        const word = await Word.findByIdAndUpdate(req.params.id, req.body.word, {
            'new': true,
            'runValidators': true
        });
        if (!word) {
            res.status(404).send("Word not found!")
        }
        res.redirect("/words")
    } catch (e) {
        res.status(418).send(e)
    }
});

// DESTROY remove word from db and redirect to index
router.delete("/:id", async (req, res) => {
    try {
        await Word.findByIdAndDelete(req.params.id);
        res.redirect("/words")
    } catch (e) {
        res.status
    }

})

module.exports = router