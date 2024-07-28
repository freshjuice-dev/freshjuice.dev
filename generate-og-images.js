import nodeHtmlToImage from "node-html-to-image";
import fs from "fs";
import chalk from "chalk";
import { image as gravatarImage } from "gravatar-gen";

// read args
const mode = process.argv[2] || ""; // all or force

console.log(chalk.blue("Generating OG images..."));
console.log(chalk.blue("Mode:", mode || "normal"));
console.log(chalk.blue("Please wait..."));

if (!fs.existsSync("./_temp/titles-for-og-images.json")) {
  console.log(
    chalk.red(
      "File ./_temp/titles-for-og-images.json does not exist. Please run `npm run build` first.",
    ),
  );
  process.exit(1);
}

const dataPosts = JSON.parse(
  fs.readFileSync("./_temp/titles-for-og-images.json", "utf-8"),
);

const bgColors = [
    "red",
    "candy",
    "mango",
    "avocado",
    "raspberry",
    "banana",
    "apple",
    "pineapple",
    "blueberry",
    "grape",
    "cherry",
    "lime",
    "peach",
    "lemon",
];

const htmlTemplate = `
<html lang="en" style="width: 1200px; height: 630px;">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}}</title>
  <style>
    .card,
    .red {
      background-image: linear-gradient(147deg, #ecd32f 0%, #FF7F50 50%, #FF2525 74%);
    }
    .candy {
      background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #dca035 100%);
    }
    .mango {
      background-image: linear-gradient(135deg, #F09819 0%, #EDDE5D 50%, #F08080 100%);
    }
    .avocado {
      background-image: linear-gradient(135deg, #87a800 0%, #f80037 50%, #deaa00 100%);
    }
    .raspberry {
      background-image: linear-gradient(135deg, #B24592 0%, #e8ca41 50%, #F15F79 100%);
    }
    .banana {
      background-image: linear-gradient(135deg, #d7af06 0%, #ff8900 50%, #ff199b 100%);
    }
    .apple {
      background-image: linear-gradient(135deg, #ffd52f 0%, #a4ff93 50%, #f32d86 100%);
    }
    .pineapple {
      background-image: linear-gradient(155deg, #bea30d 0%, #FF7F50 45%, #B22222 100%);
    }
    .blueberry {
      background-image: linear-gradient(125deg, #008cff 0%, #e50db2 45%, #ee7845 100%);
    }
    .grape {
      background-image: linear-gradient(105deg, #ef2cef 0%, #ff4c64 45%, #ffc64a 100%);
    }
    .cherry {
      background-image: linear-gradient(155deg, #ef5aec 0%, #f57d34 45%, #f53030 100%);
    }
    .lime {
      background-image: linear-gradient(145deg, #e7c00b 0%, #d66aff 45%, #fc0061 100%);
    }
    .peach {
      background-image: linear-gradient(140deg, #ff9435 0%, #f86b80 45%, #ffd069 100%);
    }
    .lemon {
      background-image: linear-gradient(150deg, #cb5dc6 0%, #F0E68C 45%, #FFD700 100%);
    }
    h1 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    .shadow {
      text-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .img-shadow {
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .logo {
      background: rgba(255,255,255,.8);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 100px;
      line-height: 0;
      border-radius: 999px;
      border: 4px solid #525252;
      width: 120px;
      height: 120px;
      overflow: hidden;
    }
  </style>
</head>
<body style="width: 1200px; height: 630px; padding: 0; margin: 0; font-family: sans-serif">
  <div class="card {{bgColor}}" style="width: 1200px; height: 630px; box-sizing: border-box; color: #fff; padding: 70px 70px">
    <div class="logo">{{{logo}}}</div>
    <h1 class="shadow" style="font-size: 72px; font-weight: 700; margin: 20px 0 10px 40px;">{{title}}</h1>
    <p class="shadow" style="margin: 20px 0 0 40px; font-size: 24px; font-weight: 700;">FRESHJUICE.DEV {{collection}}</p>
  </div>
</body>
`;

const generateImage = async (post) => {
  const outputPath = `./src/public/img/og/${post.slug}.png`;
  let logo = "🍹";
  if (!['all','force'].includes(mode) && fs.existsSync(outputPath)) {
    console.log(chalk.yellow(`⚠️ Image for ${post.title} already exists`));
    return;
  }
  post.title = post.title.trim().replaceAll(/&amp;/g, "and");
  post.collection = "";
  if (post.slug.startsWith("blog")) {
    post.collection = "/ BLOG";
  } else if (post.slug.startsWith("docs")) {
    post.collection = "/ DOCS";
  }else if (post.slug.startsWith("authors-")) {
    post.collection = "/ AUTHORS";
    logo = await gravatarImage(post.email, { size: 150 });
    logo = `<img src="${logo}" alt="Author Image" style="width: 100%; height: 100%" />`;
  }
  await nodeHtmlToImage({
    output: outputPath,
    content: {
      logo: logo,
      title: post.title,
      slug: post.slug,
      collection: post.collection,
      bgColor: bgColors[Math.floor(Math.random() * bgColors.length)],
    },
    html: htmlTemplate,
  }).then(() => {
    console.log(chalk.green(`✅ Generated image for ${post.title}`));
  });
};

let posts = [...dataPosts.blogs, ...dataPosts.docs, ...dataPosts.authors, ...dataPosts.pages];

// start the process
(async () => {
  for (const post of posts) {
    await generateImage(post);
  }
  console.log(chalk.blue("All done!"));
})();
