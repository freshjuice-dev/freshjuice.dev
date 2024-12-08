// npm install node-html-to-image --no-save
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
      text-wrap: pretty;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    h1 span {
      white-space: nowrap !important;
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
    .logo img {
        /*filter: drop-shadow(0 0 0.45rem crimson);*/
        filter: drop-shadow(0 0 0.35rem rgba(0,0,0,0.7));
    }
  </style>
</head>
<body style="width: 1200px; height: 630px; padding: 0; margin: 0; font-family: sans-serif">
  <div class="card {{bgColor}}" style="width: 1200px; height: 630px; box-sizing: border-box; color: #fff; padding: 70px 70px">
    <div class="logo">{{{logo}}}</div>
    <h1 class="shadow" style="font-size: 72px; font-weight: 700; margin: 20px 0 10px 40px;">{{{title}}}</h1>
    <p class="shadow" style="margin: 20px 0 0 40px; font-size: 24px; font-weight: 700;">FRESHJUICE.DEV {{collection}}</p>
  </div>
</body>
`;

const generateImage = async (post) => {
  const outputPath = `./_static/img/og/${post.slug}.png`;
  let logo = "🍹";
  logo = `<img src="data:image/png;base64,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" alt="Fresh Juice Logo" style="width: 100%; height: 100%" />`;
  if (!['all','force'].includes(mode) && fs.existsSync(outputPath)) {
    console.log(chalk.yellow(`⚠️ Image for ${post.title} already exists`));
    return;
  }
  post.title = post.title.trim().replaceAll(/&amp;/g, "and");
  post.collection = "";
  if (post.slug.startsWith("blog") || post.slug.startsWith("tags")) {
    post.collection = "/ BLOG";
  } else if (post.slug.startsWith("docs")) {
    post.collection = "/ DOCS";
  } else if (post.slug.startsWith("tools")) {
    post.collection = "/ TOOLS";
  } else if (post.slug.startsWith("authors-")) {
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

// start the process
(async () => {
  for (const post of dataPosts) {
    await generateImage(post);
  }
  console.log(chalk.blue("All done!"));
})();
