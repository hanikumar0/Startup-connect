import axios from "axios";
import ExternalProfile from "../models/ExternalProfile.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Fetch top startups from Product Hunt
 */
export const fetchProductHunt = async () => {
    let phCount = 0;
    let logoCount = 0;
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
                makers {
                  name
                }
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
                createdAt
                thumbnail {
                  url
                }
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

        if (response.data?.errors) {
            console.error("PH GraphQL Errors:", response.data.errors);
        }

        const posts = response.data?.data?.posts?.edges || [];
        phCount = posts.length;

        for (const edge of posts) {
            const node = edge.node;
            if (!node.name) continue;

            let logoUrl = node.thumbnail?.url;
            if (!logoUrl && node.website) {
                try {
                    const hostname = new URL(node.website).hostname;
                    logoUrl = `https://img.logo.dev/${hostname}?token=${process.env.LOGODEV_PUBLISHABLE_KEY}`;
                    logoCount++;
                } catch (e) {
                    logoUrl = null; // Fallback to default avatar in UI
                }
            } else if (logoUrl) {
                logoCount++;
            }

            await ExternalProfile.findOneAndUpdate(
                { name: node.name, source: "producthunt" },
                {
                    name: node.name,
                    firm: node.name,
                    website: node.website || "",
                    industry: node.topics?.edges?.[0]?.node?.name || "Technology",
                    source: "producthunt",
                    type: "startup",
                    leadType: "startup",
                    metadata: {
                        tagline: node.tagline,
                        makers: node.makers ? node.makers.map(m => m.name) : [],
                        topics: node.topics?.edges ? node.topics.edges.map(e => e.node.name) : [],
                        launchDate: node.createdAt,
                        logo: logoUrl
                    }
                },
                { upsert: true, new: true }
            );
        }
        return { phCount, logoCount };
    } catch (error) {
        console.error("Product Hunt fetch error:", error.response?.data || error.message);
        return { phCount: 0, logoCount: 0 };
    }
};

/**
 * Fetch top startups from GitHub (trending repos)
 */
export const fetchGitHub = async () => {
    let ghCount = 0;
    let logoCount = 0;
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
        ghCount = repos.length;

        for (const repo of repos) {
            let hostname = "github.com";
            try {
                if (repo.homepage) hostname = new URL(repo.homepage).hostname;
            } catch (e) {}

            const logoUrl = `https://img.logo.dev/${hostname}?token=${process.env.LOGODEV_PUBLISHABLE_KEY}`;
            logoCount++;

            await ExternalProfile.findOneAndUpdate(
                { name: repo.name, source: "github" },
                {
                    name: repo.name,
                    firm: repo.owner?.login,
                    website: repo.homepage || repo.html_url,
                    industry: "Software Development",
                    source: "github",
                    type: "startup",
                    leadType: "startup",
                    metadata: {
                        description: repo.description,
                        stars: repo.stargazers_count,
                        topics: repo.topics || [],
                        owner: repo.owner?.login,
                        logo: logoUrl
                    }
                },
                { upsert: true, new: true }
            );
        }
        return { ghCount, logoCount };
    } catch (error) {
        console.error("GitHub fetch error:", error.message);
        return { ghCount: 0, logoCount: 0 };
    }
};

/**
 * Master Ingestion Cron Function
 */
export const runMasterIngestion = async () => {
    console.log("\n--- Starting Strategic Federated Ingestion ---");
    
    const phResult = await fetchProductHunt();
    const ghResult = await fetchGitHub();
    
    const logoTotalCount = phResult.logoCount + ghResult.logoCount;
    const savedCount = await ExternalProfile.countDocuments();

    console.log(`Fetched ${phResult.phCount} posts from Product Hunt.`);
    console.log(`Fetched ${ghResult.ghCount} repos from GitHub.`);
    console.log(`Fetched ${logoTotalCount} logos from Logo.dev.`);
    console.log(`Saved ${savedCount} external profiles.`);

    console.log(`\nIngestion Complete:`);
    console.log(`${phResult.phCount} PH`);
    console.log(`${ghResult.ghCount} GitHub`);
    console.log(`${logoTotalCount} Logo.dev entries processed.`);
    console.log(`${savedCount} total external intelligence records available.\n`);

    return { 
        phCount: phResult.phCount, 
        ghCount: ghResult.ghCount, 
        logoCount: logoTotalCount,
        savedCount
    };
};
