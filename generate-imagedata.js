#!/bin/node

const fs = require("fs");

const IMAGES_DIR = "./content/images/";

var list = [];

directories = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
directories.forEach(category_dir => {
    if (category_dir.isDirectory()) {

        directory = {};

        directory["name"] = category_dir.name;

        try {
            let title = fs.readFileSync(IMAGES_DIR + category_dir.name + "/title.txt",
                {encoding: 'utf8', flag: 'r'});
            directory["title"] = title.trim();
        } catch (e) {
            directory["title"] = category_dir.name;
        }

        directory["images"] = [];
        directories = fs.readdirSync(IMAGES_DIR + category_dir.name, { withFileTypes: true });
        directories.forEach(image => {
            if (image.isFile() && image.name != "title.txt") {
                directory["images"].push(image.name);
            }
        });

        list.push(directory);
    }
});

fs.writeFileSync("content/imagedata.js", "var imagedata = " + JSON.stringify(list));

