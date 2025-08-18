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
      background-image: linear-gradient(147deg, #b31217 0%, #e52d27 50%, #ff512f 100%);
    }

    .candy {
      background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 50%, #ffcc70 100%);
    }

    .mango {
      background-image: linear-gradient(135deg, #ff512f 0%, #f09819 50%, #ffb347 100%);
    }

    .avocado {
      background-image: linear-gradient(135deg, #3ca55c 0%, #b5ac49 50%, #e0c97d 100%);
    }

    .raspberry {
      background-image: linear-gradient(135deg, #8e2de2 0%, #ff0844 50%, #ff6a88 100%);
    }

    .banana {
      background-image: linear-gradient(135deg, #ffcc00 0%, #ff9900 50%, #ff5f6d 100%);
    }

    .apple {
      background-image: linear-gradient(135deg, #56ab2f 0%, #a8e063 50%, #ff6a00 100%);
    }

    .pineapple {
      background-image: linear-gradient(155deg, #f7971e 0%, #ffd200 50%, #f953c6 100%);
    }

    .blueberry {
      background-image: linear-gradient(125deg, #283c86 0%, #6a11cb 50%, #2575fc 100%);
    }

    .grape {
      background-image: linear-gradient(105deg, #7b4397 0%, #dc2430 50%, #ff7e5f 100%);
    }

    .cherry {
      background-image: linear-gradient(155deg, #cb356b 0%, #bd3f32 50%, #ff416c 100%);
    }

    .lime {
      background-image: linear-gradient(145deg, #56ab2f 0%, #a8e063 50%, #f9d423 100%);
    }

    .peach {
      background-image: linear-gradient(140deg, #ff7e5f 0%, #feb47b 50%, #ffd194 100%);
    }

    .lemon {
      background-image: linear-gradient(150deg, #f7971e 0%, #ffd200 50%, #f9d423 100%);
    }
     h1 {
      display: -webkit-box;
      text-wrap: pretty;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    h1 span {
      display: block;
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
  logo = `<img src="https://freshjuice.dev/img/logo.png" alt="Fresh Juice Logo" style="width: 100%; height: 100%" />`;
  if (!["all", "force"].includes(mode) && fs.existsSync(outputPath)) {
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
    logo = `<img class="author" src="${logo}" alt="Author Image" style="width: 100%; height: 100%" />`;
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
