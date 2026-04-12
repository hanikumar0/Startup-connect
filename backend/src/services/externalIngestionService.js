import axios from "axios";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import ExternalProfile from "../models/ExternalProfile.js";
import dotenv from "dotenv";

dotenv.config();

// STEP 2 — CREATE DYNAMIC STATS OBJECT (Fix Requirement)
export const ingestionStats = {
    productHunt: 0,
    github: 0,
    investors_raw: 0,
    logo: 0,
    total: 0
};

/**
 * Fetch top startups from Product Hunt
 */
export const fetchProductHunt = async () => {
    let phBatch = 0;
    try {
        const query = `
        {
          posts(first: 20, featured: true) {
            edges {
              node {
                id
                name
                tagline
                website
                makers { name }
                topics { edges { node { name } } }
                createdAt
                thumbnail { url }
              }
            }
          }
        }
        `;

        const response = await axios.post(
            "https://api.producthunt.com/v2/api/graphql",
            { query },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PRODUCTHUNT_TOKEN}`,
                },
            }
        );

        const posts = response.data?.data?.posts?.edges || [];
        phBatch = posts.length;
        
        // STEP 3 — AUTO COUNT PRODUCT HUNT
        ingestionStats.productHunt = phBatch;

        for (const edge of posts) {
            const node = edge.node;
            if (!node.name) continue;

            let logoUrl = node.thumbnail?.url;
            if (!logoUrl && node.website) {
                try {
                    const hostname = new URL(node.website).hostname;
                    logoUrl = `https://img.logo.dev/${hostname}?token=${process.env.LOGODEV_PUBLISHABLE_KEY}`;
                    // STEP 6 — COUNT LOGO ENRICHMENT
                    ingestionStats.logo++;
                } catch (e) {}
            } else if (logoUrl) {
                ingestionStats.logo++;
            }

            await ExternalProfile.findOneAndUpdate(
                { name: node.name, source: "producthunt" },
                {
                    name: node.name,
                    description: node.tagline || "",
                    website: node.website || "",
                    logo: logoUrl,
                    tags: node.topics?.edges?.map(e => e.node.name) || ["Technology"],
                    industry: node.topics?.edges?.[0]?.node?.name || "Technology",
                    source: "producthunt",
                    type: "startup",
                    isExternal: true,
                    metadata: {
                        tagline: node.tagline,
                         makers: node.makers?.map(m => m.name)
                    }
                },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error("PH Import Error:", error.message);
    }
};

/**
 * Fetch top startups from GitHub (trending repos)
 */
export const fetchGitHub = async () => {
    try {
        const response = await axios.get(
            `https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=20`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        const repos = response.data?.items || [];
        // STEP 4 — AUTO COUNT GITHUB
        ingestionStats.github = repos.length;

        for (const repo of repos) {
            let hostname = "github.com";
            try {
                if (repo.homepage) hostname = new URL(repo.homepage).hostname;
            } catch (e) {}

            const logoUrl = `https://img.logo.dev/${hostname}?token=${process.env.LOGODEV_PUBLISHABLE_KEY}`;
            ingestionStats.logo++;

            await ExternalProfile.findOneAndUpdate(
                { name: repo.name, source: "github" },
                {
                    name: repo.name,
                    description: repo.description || `Trending repository by ${repo.owner?.login}`,
                    website: repo.homepage || repo.html_url,
                    logo: logoUrl,
                    tags: [repo.language, "open-source"].filter(Boolean),
                    industry: "Software Development",
                    source: "github",
                    type: "startup",
                    isExternal: true,
                    metadata: {
                        stars: repo.stargazers_count,
                        owner: repo.owner?.login
                    }
                },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error("GitHub Import Error:", error.message);
    }
};

/**
 * STEP 5 — AUTO COUNT investors_raw.csv
 */
export const fetchInvestorsCSV = async () => {
    try {
        const csvPath = path.join(process.cwd(), "investors_raw.csv");
        const filePath = fs.existsSync(csvPath) ? csvPath : "C:\\startup connect\\.agent\\scratch\\investors_raw.csv";
        
        if (!fs.existsSync(filePath)) {
            console.log("investors_raw.csv not found, skipping CSV ingestion.");
            return;
        }

        const results = [];
        const stream = fs.createReadStream(filePath).pipe(csvParser());

        for await (const row of stream) {
            const name = row['Investor name'] || row['Name'] || "";
            if (name.trim()) {
                results.push({
                    name: name.trim(),
                    website: row['Website'] || "",
                    industry: row['Industry'] || row['Focus'] || "Venture Capital"
                });
            }
        }

        ingestionStats.investors_raw = results.length;

        for (const data of results) {
            let logoUrl = "";
            try {
                if (data.website) {
                    const domain = new URL(data.website).hostname;
                    logoUrl = `https://img.logo.dev/${domain}?token=${process.env.LOGODEV_PUBLISHABLE_KEY}`;
                    ingestionStats.logo++;
                }
            } catch (e) {}

            await ExternalProfile.findOneAndUpdate(
                { name: data.name, source: "csv" },
                {
                    name: data.name,
                    description: `Institutional investor from CSV dataset. Focus: ${data.industry}`,
                    website: data.website || "",
                    logo: logoUrl,
                    tags: [data.industry, "csv"].filter(Boolean),
                    industry: data.industry,
                    source: "csv",
                    type: "investor",
                    isExternal: true
                },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error("CSV Import Error:", error.message);
    }
};

/**
 * Master Ingestion Cron Function
 */
export const runMasterIngestion = async () => {
    console.log("\n--- Starting Strategic Federated Ingestion ---");
    
    // Reset logo count for fresh run
    ingestionStats.logo = 0;

    await Promise.all([
        fetchProductHunt(),
        fetchGitHub(),
        fetchInvestorsCSV()
    ]);
    
    // STEP 7 — SET TOTAL COUNT
    ingestionStats.total = await ExternalProfile.countDocuments({ isExternal: true });

    // STEP 8 — BACKEND LOG OUTPUT
    console.log("================================");
    console.log("INGESTION SUMMARY");
    console.log("================================");
    console.log("Product Hunt:", ingestionStats.productHunt);
    console.log("GitHub:", ingestionStats.github);
    console.log("investors_raw.csv:", ingestionStats.investors_raw);
    console.log("Logo.dev enriched:", ingestionStats.logo);
    console.log("Total External Records:", ingestionStats.total);
    console.log("================================");

    return ingestionStats;
};
