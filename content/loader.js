/**
 * Content loader for floriankaempf.com
 * Loads content from markdown files + publications from Semantic Scholar API.
 * Edit the .md files to update content without touching HTML.
 */

var SEMANTIC_SCHOLAR_ID = '2350578684';

// Papers with co-first authorship (DOI -> list of co-first author last names)
var CO_FIRST_AUTHORS = {
  '10.1101/2025.03.14.643363': ['Boulanger-Weill', 'Kämpf']
};

/**
 * Process inline markdown formatting:
 *   [text](url)  -> hyperlink
 *   **text**     -> bold
 *   *text*       -> italic
 */
function formatInline(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/**
 * Parse research.md
 * First block (before ---) = intro paragraph
 * Subsequent blocks = title line + body text
 */
function parseResearch(text) {
  var blocks = text.trim().split(/\n---\n/);
  var html = '';

  // First block is the intro paragraph
  if (blocks.length > 0) {
    html += '<p class="research-intro">' + formatInline(blocks[0].trim()) + '</p>';
  }

  // Remaining blocks: tag, # title, body
  for (var i = 1; i < blocks.length; i++) {
    var lines = blocks[i].trim().split('\n');
    var tag = lines[0].trim();
    var title = '';
    var body = [];
    for (var j = 1; j < lines.length; j++) {
      if (lines[j].trim().indexOf('# ') === 0) {
        title = lines[j].trim().substring(2);
      } else if (lines[j].trim()) {
        body.push(lines[j].trim());
      }
    }
    // If no # title line, tag is the heading (no separate tag badge)
    if (title) {
      html += '<div class="research-block">' +
        '<span class="research-tag">' + tag + '</span>' +
        '<h3>' + formatInline(title) + '</h3>' +
        '<p>' + formatInline(body.join(' ')) + '</p>' +
        '</div>';
    } else {
      html += '<div class="research-block">' +
        '<h3>' + formatInline(tag) + '</h3>' +
        '<p>' + formatInline(body.join(' ')) + '</p>' +
        '</div>';
    }
  }

  return html;
}

/**
 * Parse talks.md
 * Blocks separated by ---
 * Each block: type, title, venue, date (4 lines)
 */
function parseTalks(text) {
  var blocks = text.trim().split(/\n---\n/);
  var html = '';

  blocks.forEach(function(block) {
    var lines = block.trim().split('\n').filter(function(l) { return l.trim(); });
    if (lines.length < 4) return;

    var type = lines[0].trim();
    var title = lines[1].trim();
    var venue = lines[2].trim();
    var date = lines[3].trim();

    html += '<article class="talk">' +
      '<span class="talk-type">' + type + '</span>' +
      '<h3 class="talk-title">' + formatInline(title) + '</h3>' +
      '<p class="talk-venue">' + formatInline(venue) + '</p>' +
      '<p class="talk-date">' + date + '</p>' +
      '</article>';
  });

  return html;
}

/**
 * Parse cv.md
 * ## Section headers define cv-section groups
 * Within each section, entries separated by blank lines:
 *   line 1: date range (-- becomes en-dash)
 *   line 2: title (may contain [link](url))
 *   line 3: location/institution
 *   line 4 (optional): detail
 */
function parseCV(text) {
  // Split into sections by ## headers
  var sectionSplits = text.trim().split(/^## /m);
  var html = '';

  sectionSplits.forEach(function(sectionText) {
    if (!sectionText.trim()) return;

    var sectionLines = sectionText.trim().split('\n');
    var sectionTitle = sectionLines[0].trim();
    var sectionBody = sectionLines.slice(1).join('\n').trim();

    html += '<div class="cv-section">';
    html += '<h3>' + sectionTitle + '</h3>';

    // Split entries by blank lines
    var entries = sectionBody.split(/\n\s*\n/).filter(function(e) { return e.trim(); });

    entries.forEach(function(entry) {
      var lines = entry.trim().split('\n').filter(function(l) { return l.trim(); });
      if (lines.length < 2) return;

      var date = lines[0].trim().replace(/--/g, '\u2013');
      var title = lines[1].trim();
      var location = lines.length > 2 ? lines[2].trim() : '';
      var detail = lines.length > 3 ? lines[3].trim() : '';

      html += '<div class="cv-item">';
      html += '<span class="cv-date">' + date + '</span>';
      html += '<div class="cv-content">';
      html += '<strong>' + formatInline(title) + '</strong>';
      if (location) html += '<p>' + formatInline(location) + '</p>';
      if (detail) html += '<p class="cv-detail">' + formatInline(detail) + '</p>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
  });

  return html;
}

/**
 * Fetch and render markdown content into drawer sections
 */
function loadContent(basePath) {
  var sections = [
    { file: 'research.md', id: 'research', parser: parseResearch, heading: 'Research' },
    { file: 'talks.md',    id: 'talks',    parser: parseTalks,    heading: 'Talks & Posters' },
    { file: 'cv.md',       id: 'cv',       parser: parseCV,       heading: 'CV' }
  ];

  sections.forEach(function(section) {
    var container = document.getElementById(section.id);
    if (!container) return;

    fetch(basePath + section.file)
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load ' + section.file);
        return res.text();
      })
      .then(function(text) {
        var content = section.parser(text);
        container.innerHTML = '<h2>' + section.heading + '</h2>' + content;
      })
      .catch(function(err) {
        console.warn('Content load error:', err);
      });
  });

  // Load publications from Semantic Scholar
  loadPublications();
}

/**
 * Fetch publications from Semantic Scholar API
 */
function loadPublications() {
  var container = document.getElementById('publications-list');
  if (!container) return;

  fetch('https://api.semanticscholar.org/graph/v1/author/' + SEMANTIC_SCHOLAR_ID + '/papers?fields=title,year,venue,externalIds,authors&limit=50')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to fetch from Semantic Scholar');
      return res.json();
    })
    .then(function(data) {
      var papers = data.data || [];
      if (papers.length === 0) {
        container.innerHTML = '<p>No publications found.</p>';
        return;
      }

      // Build publication objects
      var allPubs = papers.map(function(p) {
        var doi = (p.externalIds && p.externalIds.DOI) || null;
        var isBiorxiv = (doi && doi.indexOf('10.1101/') === 0) ||
          (p.venue && /biorxiv/i.test(p.venue));
        return {
          title: p.title || 'Untitled',
          year: p.year || '',
          venue: p.venue || 'Preprint',
          doi: doi,
          isBiorxiv: isBiorxiv,
          authors: (p.authors || []).map(function(a) { return a.name; })
        };
      });

      // Extract significant words (4+ chars) from a title for fuzzy matching
      function titleWords(t) {
        return t.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(function(w) {
          return w.length >= 4;
        });
      }

      // Check if two titles are similar (>50% word overlap)
      function titlesSimilar(wordsA, wordsB) {
        if (wordsA.length === 0 || wordsB.length === 0) return false;
        var setB = {};
        wordsB.forEach(function(w) { setB[w] = true; });
        var overlap = 0;
        wordsA.forEach(function(w) { if (setB[w]) overlap++; });
        var smaller = Math.min(wordsA.length, wordsB.length);
        return overlap / smaller > 0.5;
      }

      // Deduplicate: if a bioRxiv preprint has a published version, suppress the preprint
      var publications = [];

      var publishedWords = [];
      allPubs.forEach(function(pub) {
        if (!pub.isBiorxiv) {
          publishedWords.push(titleWords(pub.title));
        }
      });

      allPubs.forEach(function(pub) {
        if (pub.isBiorxiv) {
          var words = titleWords(pub.title);
          var dominated = publishedWords.some(function(pw) {
            return titlesSimilar(words, pw);
          });
          if (dominated) return;
        }
        publications.push(pub);
      });

      // Sort by year descending
      publications.sort(function(a, b) { return (b.year || 0) - (a.year || 0); });

      container.innerHTML = publications.map(function(pub) {
        // Shorten names to initials + last name, bold Florian, add co-first-author stars
        var coFirst = pub.doi ? CO_FIRST_AUTHORS[pub.doi] || [] : [];
        var authorsHtml = '';
        if (pub.authors.length > 0) {
          var formatted = pub.authors.map(function(name) {
            var parts = name.trim().split(/\s+/);
            if (parts.length < 2) return name;
            var lastName = parts[parts.length - 1];
            var initials = parts.slice(0, -1).map(function(p) { return p[0] + '.'; }).join(' ');
            var short = initials + ' ' + lastName;
            // Append * for co-first authors
            for (var c = 0; c < coFirst.length; c++) {
              if (lastName === coFirst[c]) { short += '*'; break; }
            }
            return short;
          });

          // Truncate long author lists around Florian's name
          var myIdx = -1;
          for (var b = 0; b < formatted.length; b++) {
            if (/K(?:ä|ae?)mpf/i.test(formatted[b])) { myIdx = b; break; }
          }
          if (myIdx >= 0 && formatted.length > 8 && myIdx < formatted.length - 3) {
            var lastTwo = formatted.slice(-2);
            formatted = formatted.slice(0, myIdx + 1);
            formatted.push('...', lastTwo[0], lastTwo[1]);
          }

          authorsHtml = formatted.join(', ')
            .replace(/(F\.\s*(?:F\.\s*)?K(?:ä|ae?)mpf\*?)/gi, '<strong>$1</strong>');
        }

        var link = pub.doi ? 'https://doi.org/' + pub.doi : '';
        return '<article class="publication">' +
          '<h3 class="pub-title">' + (link ? '<a href="' + link + '" target="_blank" rel="noopener">' + pub.title + '</a>' : pub.title) + '</h3>' +
          (authorsHtml ? '<p class="pub-authors">' + authorsHtml + '</p>' : '') +
          '<p class="pub-journal">' + pub.venue + (pub.year ? ', ' + pub.year : '') + '</p>' +
          (link ? '<div class="pub-links"><a href="' + link + '" class="pub-link" target="_blank" rel="noopener">Paper</a></div>' : '') +
          '</article>';
      }).join('');
    })
    .catch(function(err) {
      console.error('Error loading publications:', err);
      container.innerHTML = '<p>Unable to load publications. Please try again later.</p>';
    });
}

// Auto-detect base path and load on DOMContentLoaded
(function() {
  var scripts = document.getElementsByTagName('script');
  var basePath = 'content/';
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute('src') || '';
    if (src.indexOf('loader.js') >= 0) {
      basePath = src.replace('loader.js', '');
      break;
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    loadContent(basePath);
  });
})();
