let axios = require("axios");
let cheerio = require("cheerio");
let url = require("url");
let fs = require("fs");
// import axios from "axios";
// import cheerio from "cheerio";
// import url from "url";
// import fs from "fs";

let count = 0;

Set.prototype.union = function(setB) {
  var union = new Set(this);
  for (var elem of setB) {
    union.add(elem);
  }
  return union;
};

let textUrls = fs.readFileSync(__dirname + "/urls.json").toString() || "[]";
let currentUrlsArray = JSON.parse(textUrls);
let currentUrlsSet = new Set(currentUrlsArray);

scrape(10001);

async function scrape(count) {
  try {
    console.log(`start to ${count}`);
    // textUrls = fs.readFileSync(__dirname + "/urls.json").toString() || "[]";
    // currentUrlsArray = JSON.parse(textUrls);
    // currentUrlsSet = new Set(currentUrlsArray);

    if (count > 20000) {
      return;
    }
    const targetUrl = currentUrlsArray[count];
    console.log("targetUrl", targetUrl);
    const { headers, data } = await axios.get("http://" + targetUrl, {
      timeout: 1000
    });
    //   if (
    //     headers &&
    //     headers["x-powered-by"] &&
    //     headers["x-powered-by"] === "Express"
    //   ) {
    //     console.log("express qq");
    //   }
    //   console.log(headers);

    const $ = cheerio.load(data);
    const urls = $("a")
      .map(function(i, ele) {
        const hostname = url.parse($(this).attr("href")).hostname;
        return hostname;
      })
      .get();
    let scrapeUrlsSet = new Set(urls);
    currentUrlsSet = currentUrlsSet.union(scrapeUrlsSet);
    saveToFile(currentUrlsSet);

    scrape(++count);
  } catch (error) {
    console.log("catch error", count);
    //   console.log(error);
    scrape(++count);
  }
}

function saveToFile(set) {
  const array = Array.from(set);
  const text = JSON.stringify(array);
  fs.writeFileSync(__dirname + "/urls.json", text);
  console.log("done saved");
}
