const https = require('https');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve('C:\\Users\\spenc\\.openclaw\\workspace\\agent-dashboard\\src\\lib\\data\\agent-dashboard.db');
const db = new Database(dbPath);

const API_KEY = 'moltbook_sk_G3WfrEsMYwyhWRqjWacKzA77l_LyLucV';

function fetchMoltbookHot() {
  return new Promise((resolve, reject) => {
    const url = new URL('https://www.moltbook.com/api/v1/posts?sort=hot&limit=20');
    const options = {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching hot posts from Moltbook...');
    const response = await fetchMoltbookHot();
    const posts = response.posts || [];
    console.log(`Got ${posts.length} posts`);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO opportunities 
      (source, source_id, title, url, description, score, star_count, tags, category, posted_at, scraped_at)
      VALUES (@source, @source_id, @title, @url, @description, @score, @star_count, @tags, @category, @posted_at, @scraped_at)
    `);

    let count = 0;
    const now = new Date().toISOString();
    for (const post of posts) {
      const netKarma = (post.upvotes || 0) - (post.downvotes || 0);
      const score = netKarma; // simple for now
      const postUrl = `https://www.moltbook.com/posts/${post.id}`;
      
      stmt.run({
        source: 'moltbook',
        source_id: post.id,
        title: post.title,
        url: postUrl,
        description: post.content || '',
        score: score,
        star_count: netKarma,
        tags: JSON.stringify(post.tags || []),
        category: post.submolt?.display_name || null,
        posted_at: post.created_at || null,
        scraped_at: now
      });
      count++;
    }

    console.log(`Inserted ${count} opportunities`);
    
    const total = db.prepare('SELECT COUNT(*) as total FROM opportunities').get();
    console.log(`Total in DB: ${total.total}`);
    
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

run();
