/**
 * Content loader for floriankaempf.com
 * Loads content from markdown files + publications from Semantic Scholar API.
 * Edit the .md files to update content without touching HTML.
 * Fallback content embedded for file:// protocol compatibility.
 */

var SEMANTIC_SCHOLAR_ID = '2350578684';

// Papers with co-first authorship (DOI -> list of co-first author last names)
var CO_FIRST_AUTHORS = {
  '10.1101/2025.03.14.643363': ['Boulanger-Weill', 'Kämpf']
};

// Fallback content for when fetch() fails (e.g. file:// protocol)
var FALLBACK_CONTENT = {
  'research.md': 'I study how sensory inputs are transformed into persistent internal states that drive context-appropriate behaviour.\n\n---\n\nCurrent\n# Internal States in Drosophila\nMy PhD investigates how contact chemosensation induces internal states in male *Drosophila melanogaster*. When a male fly touches another fly, pheromone cues trigger either courtship (female) or aggression (male), yet both behaviours share underlying neural circuitry through P1 neurons. I\'m dissecting how the brain distinguishes these contexts and selects appropriate behavioural outputs. I combine connectomics (using the [male CNS connectome](https://male-cns.janelia.org/)), behavioural assays with optogenetic manipulation, and two-photon calcium imaging to map the circuit from sensory input to motor output.\n\n---\n\nPrevious\n# Neural basis of evidence integration in larval zebrafish\nDuring my MSc, I studied the motion evidence integrator circuit in larval zebrafish: a neural system that accumulates noisy visual information to drive swim decisions. Using functionally-guided photoactivation combined with mRNA in situ hybridization, I mapped the morphology and neurotransmitter identity of circuit components, establishing a structure-to-function relationship validated against electron microscopy reconstructions. This work culminated in a [co-first author paper](https://doi.org/10.1101/2025.03.14.643363) combining CLEM with functional imaging to reveal the circuit architecture underlying evidence accumulation.\n\n---\n\nApproach\nMy scientific path started with a childhood fascination for fish and programming, two interests that seemed unrelated until I found myself studying how neural circuits compute behaviour. From cichlid social dynamics at Lake Tanganyika to motion integration in zebrafish to internal states in flies, I\'ve been drawn to understanding how brains implement computations that transform sensory inputs into adaptive actions. I combine connectomics with functional imaging and behavioural experiments, always looking for the link between circuit structure and the computations it performs.',

  'talks.md': 'Talk\nContact Chemosensation and Neural Control of Internal States in Drosophila melanogaster\nCambrain\nOctober 2025, Cambridge, UK\n\n---\n\nPoster\nDissection of a neuronal integrator circuit through functionally guided photoactivations and neurotransmitter identifications\nFENS Forum 2024\nJune 2024, Vienna, Austria\n\n---\n\nPoster\nDissection of a neuronal integrator circuit through functionally guided photoactivations and neurotransmitter identifications\nZebrafish Neurobiology Meeting, Cold Spring Harbor Laboratory\nNovember 2023, NY, USA\n\n---\n\nPoster\nDissection of a neuronal integrator circuit through correlated light and electron microscopy in the larval zebrafish\nSociety for Neuroscience Meeting\nNovember 2023, Chicago, USA\n\n---\n\nTalk\nConnecting cell functionality to cell morphology through light microscopy\nNeuroTuscany: Circuits and Behaviour\nJune 2023, Montecastelli, Italy',

  'cv.md': '## Fellowships & Funding\n\n2025--2028\n[Boehringer Ingelheim Fonds PhD Fellowship](https://bifonds.de/fellowships-grants/phd-fellowships.html)\nCompetitive fellowship for outstanding junior scientists in basic biomedical research (<10% acceptance)\n\n2024--2028\n[MRC Studentship](http://mrclmb.ac.uk/careers-and-people/phd-students/funding/)\nFully-funded PhD studentship at the MRC Laboratory of Molecular Biology\n\n## Research Experience\n\n2024--present\nPhD Researcher, [Jefferis Lab](https://flybrain.mrc-lmb.cam.ac.uk/jefferislabwebsite/)\nMRC-LMB, Cambridge\nConnectome analysis, 2-photon microscopy, VR behaviour setups\n\n2021--2024\nResearch Assistant, [Bahl Lab](https://www.neurobiology-konstanz.com/bahl)\nUniversity of Konstanz\nFunctional imaging, CLEM, zebrafish neural circuits\n\n2021\nField Assistant, Jordan Lab\nLake Tanganyika, Zambia\nScientific diving, cichlid behaviour research\n\n2018--2019\nResearch Assistant, Jordan Lab\nUniversity of Konstanz\nSocial behaviour in cichlids, experimental design\n\n## Education\n\n2024--present\nPhD, Biological Sciences\nMRC Laboratory of Molecular Biology, University of Cambridge\n[Jefferis Lab](https://flybrain.mrc-lmb.cam.ac.uk/jefferislabwebsite/). Contact chemosensation and neural control of internal states in *Drosophila*\n\n2021--2024\nMSc, Biological Sciences\nUniversity of Konstanz, Germany\n[Bahl Lab](https://www.neurobiology-konstanz.com/bahl). Mapping functional dynamics and neuronal structure in a hindbrain neural integrator circuit\n\n2017--2021\nBSc, Biological Sciences\nUniversity of Konstanz, Germany\nJordan Lab. Evaluating the effect of simulated predation on contest behaviour in cichlids'
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

    function renderContent(text) {
      var content = section.parser(text);
      container.innerHTML = '<h2>' + section.heading + '</h2>' + content;
    }

    fetch(basePath + section.file)
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load ' + section.file);
        return res.text();
      })
      .then(renderContent)
      .catch(function(err) {
        console.warn('Content load error (' + section.file + '), using fallback:', err.message);
        if (FALLBACK_CONTENT[section.file]) {
          renderContent(FALLBACK_CONTENT[section.file]);
        }
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
