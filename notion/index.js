import { config } from "dotenv";

config();

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { Downloader } from "nodejs-file-downloader";
import { existsSync, writeFile } from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const download = async (url, path) => {
  path = `assets/${path}`;

  const fileName = url.split('?')[0].split('/').pop();
  const filePath = `${path}/${fileName}`;

  if (existsSync(filePath)) {
    return filePath.replace('assets/', '');
  }

  const downloader = new Downloader({
    url: url,
    directory: path,
  });

  return (await downloader.download()).filePath.replace('assets/', '');
}

const writeProject = (project) => {
  const path = `content/projekte/${project.title}.md`;

  const content = `---
title: "${project.title}"
date: "${project.date}"
lastmod: "${project.lastmod}"
publishDate: "${project.publishDate}"
expiryDate: "${project.expiryDate}"
summary: "${project.summary}"
tags: ${JSON.stringify(project.tags)}
images: ${JSON.stringify(project.images)}
notionUrl: "${project.notionUrl}"
---

${project.content}`;

  writeFile(path,
    content,
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};


const loadProjects = async () => {
  const response = await notion.databases.query({
    database_id: "10ebe61fc1ef8083bb97cf9570d334ae"
  });

  for (const page of response.results) {
    const props = page.properties;
    const project = {};
    
    project["title"] = props.Name.title[0].plain_text;
    project["publishDate"] = props.Publikation.date?.start;
    project["expiryDate"] = props.Publikation.date?.end;
    project["summary"] = props.Zusammenfassung.rich_text[0].plain_text;
    project["tags"] = props.Tags.multi_select.map((tag) => tag.name);

    project["date"] = page.created_time;
    project["lastmod"] = page.last_edited_time;
    project["notionUrl"] = page.url;

    if (!project["publishDate"]) {
      continue;
    }

    if (page.cover?.type == "external") {
      project["images"] = [page.cover.external.url];
    } else if (page.cover?.type == "file") {
      project["images"] = [await download(page.cover.file.url, "images")];
    } else {
      project["images"] = [];
    }

    const mdblocks = await n2m.pageToMarkdown(page.id);
    project["content"] = n2m.toMarkdownString(mdblocks).parent;

    writeProject(project);
  }
};

(async () => {
  await loadProjects();
  // const mdblocks = await n2m.pageToMarkdown(process.env.NOTION_PAGE_ID);
  // const mdString = n2m.toMarkdownString(mdblocks);
  // console.log(mdblocks);
})();
