/**
 * Starter blog — `npm run seed-blog`.
 *
 * Five posts written for the people who actually buy this furniture: procurement and facilities
 * managers specifying a floor, and the architects who draw it. Every claim is one DecArt can
 * stand behind (in-house manufacturing, component test reports, same-day quoting) — no invented
 * certifications, clients or statistics.
 *
 * Idempotent: a slug that already exists is left alone, so the client's own edits survive.
 */
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import { randomUUID } from 'node:crypto';

import { ensureSchema } from '../src/lib/schema';
import { readingMinutes } from '../src/lib/utils';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

type Post = {
  title: string;
  slug: string;
  excerpt: string;
  cover: { src: string; alt: string };
  tags: string[];
  relatedProductSlugs: string[];
  seo: { metaTitle: string; metaDescription: string };
  html: string;
};

const POSTS: Post[] = [
  {
    title: 'How to specify office chairs for a whole floor',
    slug: 'how-to-specify-office-chairs-for-a-floor',
    excerpt:
      'A practical checklist for buying 50, 200 or 500 chairs at once — the six things worth arguing about, and the ones that do not matter.',
    cover: { src: '/families/task-mesh.webp', alt: 'Task mesh office chairs' },
    tags: ['Buying guide', 'Seating'],
    relatedProductSlugs: ['bonai-hb', 'bubble-mb'],
    seo: {
      metaTitle: 'How to Specify Office Chairs for a Whole Floor | DecArt Furniture',
      metaDescription:
        'A procurement checklist for bulk office chair orders: mechanism, gas lift class, foam density, castors, warranty and what to put in the tender.',
    },
    html: `
<p>Buying one chair is a matter of taste. Buying two hundred is a specification problem — and the difference between a floor that still looks right in year five and one that is being replaced in year two usually comes down to six decisions made at quotation stage.</p>

<h3>1. Start from the shift, not the showroom</h3>
<p>A chair used for a nine-hour shift needs a different build to one in a meeting room used twice a week. Before comparing models, split the floor into how the seats are actually used: full-day workstations, cabins, visitor and meeting rooms, training, and break-out. Most floors need three or four specifications, not one — and the savings on the low-use seats usually pay for the better build where people sit all day.</p>

<h3>2. The mechanism is the chair</h3>
<p>Everything else is upholstery over a frame. Ask which mechanism is fitted and what it does:</p>
<ul>
<li><strong>Synchro tilt</strong> — back and seat recline at different rates, keeping feet flat. Right for full-day desks.</li>
<li><strong>Multi-lock</strong> — the recline can be fixed at several angles rather than just free or locked.</li>
<li><strong>Knee tilt</strong> — the pivot sits forward, so the front edge stays put as you lean back.</li>
<li><strong>Fixed / cantilever</strong> — no mechanism at all. Correct and cheaper for visitor and training seating.</li>
</ul>
<p>A tilt-tension adjustment matters more than it sounds: without it, a 50 kg user and a 100 kg user cannot both be comfortable in the same chair.</p>

<h3>3. Gas lift class and castors</h3>
<p>The gas lift is the part that fails first on a cheap chair. Ask for the class and for the test report — we specify Class 3 and Class 4 lifts and can pass on the supplier's BIFMA/SGS test documentation with the quotation. Castors matter almost as much: hard nylon for carpet, soft PU for vinyl, wood or tile. Fitting the wrong one either damages the floor or makes the chair feel stuck.</p>

<h3>4. Foam density, not foam thickness</h3>
<p>Thickness is what a showroom sells; density is what survives. High-density moulded polyurethane foam holds its shape through years of daily use, where cut foam of the same thickness flattens. Ask for the foam type in writing — this is one of the easiest places for a quotation to be quietly downgraded.</p>

<h3>5. Decide the colourways before you order, not after</h3>
<p>Zoning a floor by team or department is much cheaper at order stage than later. Many of our mesh models carry a dozen or more standard combinations, so departments can be colour-coded without changing model or price. Project quantities can also be matched to a shade you send us.</p>

<h3>6. Put the specification in the PO</h3>
<p>Whatever is agreed verbally, the purchase order should name the mechanism, the gas lift class, the foam, the castor type, the upholstery, and the warranty terms per component. A quotation that lists these line by line is one you can hold someone to. One that says only "executive chair" is not.</p>

<h3>What we would send you</h3>
<p>Tell us the seat count, how each zone is used, and the site city. You will usually get a working quote the same day, with the component specification stated line by line — and a sample chair before a large order is normal, not a favour.</p>
<p><a href="/products/task-mesh">Browse task seating</a> or <a href="/quote">send the requirement</a>.</p>
`.trim(),
  },
  {
    title: 'Mesh, fabric or leatherette: choosing upholstery for an Indian office',
    slug: 'mesh-fabric-or-leatherette-office-chair-upholstery',
    excerpt:
      'Delhi summers, Mumbai humidity and Bengaluru air-conditioning all argue for different upholstery. What each material is genuinely good and bad at.',
    cover: { src: '/families/ultra-luxury-mesh.webp', alt: 'Ultra luxury mesh office chair' },
    tags: ['Materials', 'Seating'],
    relatedProductSlugs: ['mustang-hb', 'bonai-hb'],
    seo: {
      metaTitle: 'Mesh vs Fabric vs Leatherette Office Chairs in India | DecArt Furniture',
      metaDescription:
        'How mesh, fabric and leatherette behave in Indian offices — heat, humidity, cleaning, wear and cost. A practical comparison for facilities teams.',
    },
    html: `
<p>Upholstery is usually chosen from a photograph, which is why so many offices end up with the wrong one. In an Indian office the deciding factors are heat, humidity, how the space is cleaned, and who sits in the chair — not the swatch.</p>

<h3>Mesh</h3>
<p>Mesh works because it does not trap heat. Air moves through the back, so a mesh chair stays comfortable in a room where the air-conditioning is fighting a 40°C afternoon, or where it is switched off at 7pm and people work on.</p>
<ul>
<li><strong>Good for:</strong> full-day workstations, hot floors, anywhere people complain about sweating into the seat back.</li>
<li><strong>Watch for:</strong> mesh quality varies enormously. Cheap mesh sags into a hammock within a year. Ask about the weave and the frame tension, not just the word "mesh".</li>
<li><strong>Cleaning:</strong> vacuum and a damp cloth. Dust does settle in the weave.</li>
</ul>

<h3>Fabric</h3>
<p>Fabric is the middle path: warmer than mesh, softer than leatherette, and available in the widest range of colours — which is what makes it useful for zoning a floor by team.</p>
<ul>
<li><strong>Good for:</strong> mixed-use floors, meeting rooms, anywhere colour matters.</li>
<li><strong>Watch for:</strong> spills. Fabric absorbs, and chai does not come out easily. In canteens and cafés, choose something else.</li>
<li><strong>Cleaning:</strong> shampoo and extraction; budget for it once a year on heavy floors.</li>
</ul>

<h3>Leatherette</h3>
<p>Leatherette reads as senior, wipes clean in seconds, and costs a fraction of leather. That is why it dominates cabins, boardrooms and reception.</p>
<ul>
<li><strong>Good for:</strong> director and CEO cabins, boardrooms, healthcare and hospitality where surfaces are wiped down.</li>
<li><strong>Watch for:</strong> heat. Leatherette does not breathe, so it is a poor choice for a full-day seat on a hot floor. It also cracks if the backing is thin — the quality of the coating matters more than the colour.</li>
<li><strong>Cleaning:</strong> a damp cloth. No solvents; they lift the coating.</li>
</ul>

<h3>The honest recommendation</h3>
<p>Most floors we quote end up mixed: mesh at the workstations where people sit all day, leatherette in the cabins and boardroom, fabric where the client wants colour. That is not a compromise — it is specifying for use.</p>
<p>If you cannot decide, ask for samples in the actual light of the actual office. A shade that looks warm under showroom halogen can look grey under office LEDs.</p>
<p><a href="/products/mesh">See mesh seating</a>, <a href="/products/director">director chairs</a>, or <a href="/contact">ask us for swatches</a>.</p>
`.trim(),
  },
  {
    title: 'What actually makes a chair ergonomic',
    slug: 'what-actually-makes-a-chair-ergonomic',
    excerpt:
      '"Ergonomic" is printed on almost every office chair sold. Here is the short list of adjustments that genuinely change how a nine-hour day feels.',
    cover: { src: '/families/manager.webp', alt: 'Ergonomic task chair' },
    tags: ['Ergonomics', 'Seating'],
    relatedProductSlugs: ['bonai-hb', 'mustang-hb'],
    seo: {
      metaTitle: 'What Actually Makes an Office Chair Ergonomic | DecArt Furniture',
      metaDescription:
        'The adjustments that matter in an ergonomic office chair — seat height, depth, lumbar support, armrests and recline — and the features that are marketing.',
    },
    html: `
<p>Every chair in every catalogue is described as ergonomic, including chairs that are not. The word only means anything when it is attached to specific adjustments, so here is what to look for — and what to ignore.</p>

<h3>The five that matter</h3>
<ul>
<li><strong>Seat height.</strong> Feet flat on the floor, thighs roughly parallel to it. This is the one adjustment every chair has and the one most people never set correctly.</li>
<li><strong>Seat depth.</strong> Two to three fingers of gap between the back of the knee and the front edge of the seat. Too deep and the edge presses behind the knee all day; too shallow and the thighs are unsupported. Fixed-depth seats are the usual reason a chair suits one person and not another.</li>
<li><strong>Lumbar support.</strong> It has to meet the inward curve of the lower back — which means it has to move, either up and down or in and out. A moulded bump in a fixed back is not lumbar support, it is a shape.</li>
<li><strong>Armrests.</strong> Shoulders relaxed, elbows at roughly a right angle, forearms level with the desk. Height adjustment is the minimum; width and pivot help where people share desks.</li>
<li><strong>Recline with tension.</strong> Backs are not meant to be locked upright for nine hours. Useful recline means it can be locked at more than one angle <em>and</em> the resistance can be matched to the person's weight.</li>
</ul>

<h3>The ones that are mostly marketing</h3>
<p>A headrest is genuinely useful in a chair you recline in — a cabin or an executive seat — and close to useless on a chair you sit upright in to type. "Memory foam" means little without a density figure. And a chair described only as "high-back" tells you the height of the backrest and nothing about whether it fits you.</p>

<h3>Fit is not one-size</h3>
<p>The chair that suits a 5'2" person and the chair that suits a 6'2" person are not always the same chair. On large orders this is worth planning: a single well-adjustable model usually covers a floor, but if you have a wide range of builds, order a couple of alternatives rather than forcing everyone into one shell.</p>

<h3>Then set it up</h3>
<p>An adjustable chair that nobody adjusts is just an expensive chair. On installation, ten minutes showing people how the levers work returns more comfort than the next price bracket up. We are happy to run that with the handover on project deliveries.</p>
<p><a href="/products/task-mesh">Task seating</a> · <a href="/products/ultra-luxury-mesh">Ultra luxury mesh</a> · <a href="/quote">Ask for a trial chair</a></p>
`.trim(),
  },
  {
    title: 'Planning a workstation layout: linear, cluster or cubicle',
    slug: 'planning-office-workstation-layouts',
    excerpt:
      'The three layouts most Indian offices choose between, the dimensions they actually need, and the mistakes that only show up after installation.',
    cover: { src: '/families/workstation.webp', alt: 'Office workstation cluster' },
    tags: ['Workstations', 'Space planning'],
    relatedProductSlugs: [],
    seo: {
      metaTitle: 'Planning Office Workstation Layouts: Linear, Cluster or Cubicle | DecArt',
      metaDescription:
        'Linear, cluster and cubicle workstation layouts compared — typical dimensions, circulation space, power routing and the errors that appear after installation.',
    },
    html: `
<p>Workstations are the one item where a drawing error is expensive: chairs can be swapped, but a desking run that does not fit the column grid has to be re-made. A few decisions taken early prevent most of it.</p>

<h3>The three layouts</h3>
<ul>
<li><strong>Linear.</strong> Desks in a straight run, back to back or single-sided. The densest option per square foot and the simplest to extend. Best where the floor plate is regular and teams are large.</li>
<li><strong>Cluster.</strong> Four, six or eight seats arranged around a shared spine, often at 120°. Feels less like a call centre, uses a little more area per seat, and suits teams that talk to each other.</li>
<li><strong>Cubicle.</strong> Higher screens, real visual privacy, and the option of storage in the panel. Costs more per seat and eats circulation, but for finance, HR or anywhere confidential work happens, it is the right answer.</li>
</ul>

<h3>Dimensions worth holding to</h3>
<p>These are the common working figures; your architect may vary them, but be deliberate about it rather than accidental:</p>
<ul>
<li><strong>Desk width per seat:</strong> 1200 mm is standard, 1500 mm for dual-monitor or design work, 1050 mm only where space is genuinely tight.</li>
<li><strong>Desk depth:</strong> 600 mm works with a flat panel monitor; 750 mm is more comfortable and necessary if a CPU sits on the desk.</li>
<li><strong>Desk height:</strong> 750 mm fixed is the norm. Height-adjustable is worth it for shared desks and shift working.</li>
<li><strong>Circulation behind a seated person:</strong> allow around 900 mm to 1000 mm so someone can walk past a pushed-back chair.</li>
<li><strong>Screen height:</strong> 400 mm above the desk gives seated privacy; 1200 mm and above starts to become a cubicle.</li>
</ul>

<h3>Power and data, decided before fabrication</h3>
<p>This is where most layouts come unstuck. Decide before manufacture whether power runs in the spine, under the desk, or drops from the ceiling; how many sockets and data points per seat; and where the cable exits. Retro-fitting a wire management route into a finished run is slow and rarely looks intentional.</p>

<h3>Two mistakes we see repeatedly</h3>
<p><strong>Measuring the room, not the obstacles.</strong> Columns, beams, sprinkler drops and the swing of the fire door all cut into a run. A layout that works on a clean rectangle can lose two seats to a single column.</p>
<p><strong>Forgetting the chair.</strong> A 1200 mm desk with a chair that needs 700 mm to push back is a 1900 mm footprint. Plan seat and desk together.</p>

<h3>How we quote it</h3>
<p>Send the floor plan — even a PDF or a phone photo of a printout — with the seat count and the city. We come back with a layout and a per-seat cost, and we make the desking, screens and storage in our own factory, so what is drawn is what gets built.</p>
<p><a href="/products/workstation">See workstations</a> · <a href="/products/cubicle">Cubicles</a> · <a href="/quote?type=bulk">Send a floor plan</a></p>
`.trim(),
  },
  {
    title: 'What to check before you sign an office furniture quotation',
    slug: 'what-to-check-in-an-office-furniture-quotation',
    excerpt:
      'Two quotations for "the same" chair can differ by 40%. Nine things to compare so you know whether you are getting a better price or a lesser chair.',
    cover: { src: '/families/executive.webp', alt: 'Executive office chair' },
    tags: ['Procurement', 'Buying guide'],
    relatedProductSlugs: [],
    seo: {
      metaTitle: 'What to Check in an Office Furniture Quotation | DecArt Furniture',
      metaDescription:
        'Nine checks for comparing office furniture quotations: component specification, foam, warranty terms, freight, lead time, taxes and tender documentation.',
    },
    html: `
<p>When two quotations for the same-looking chair differ by a third, the difference is real — it is just not in the photograph. These are the lines to compare before deciding which is better value.</p>

<h3>1. Is the component specification written down?</h3>
<p>Mechanism, gas lift class, base material, castor type, foam type, upholstery grade. If a quotation names none of these, you are comparing pictures, not products.</p>

<h3>2. Who made the components, and can they show test reports?</h3>
<p>Gas lifts, castors and mechanisms are usually bought in, even by manufacturers. Ask whether the supplier can produce BIFMA or SGS test documentation for them. We pass those reports on with project submissions, and a supplier who cannot produce any is telling you something.</p>

<h3>3. Foam: type and density</h3>
<p>High-density moulded PU and cut foam of the same thickness feel identical in a showroom and completely different after a year. It should be stated.</p>

<h3>4. What exactly does the warranty cover?</h3>
<p>"One year warranty" is meaningless on its own. Manufacturing defects on the frame and the wearing components — mechanism, gas lift, castors — are usually covered for different periods. Ask for it per component, in writing, and ask how a claim is actually serviced in your city.</p>

<h3>5. Is freight included, and to where?</h3>
<p>Ex-works, to your city, or to your floor? Delivery to a loading bay is not delivery to the fourteenth floor, and lift access on a fit-out site is not a given. This line moves prices more than people expect.</p>

<h3>6. Lead time, and what it is measured from</h3>
<p>From the PO, from the advance, or from final approval of a sample? On project quantities, ask for the production slot in writing. A quotation that promises everything in ten days without asking about your approvals is optimistic.</p>

<h3>7. Installation and who does it</h3>
<p>Chairs may ship assembled or flat-packed. Workstations, cubicles and conference tables need installing, and it matters whether that is the manufacturer's team or a local crew nobody supervises.</p>

<h3>8. Taxes and documentation</h3>
<p>Confirm GST treatment and that you will get a tax invoice. For tenders and vendor registration you will also want registration details, component test reports, warranty terms and specification sheets — ask for the compliance pack up front rather than chasing it at submission.</p>

<h3>9. What happens when something arrives damaged</h3>
<p>Transit damage happens on Indian roads. What matters is the window for reporting it and what evidence is needed. Ours is 48 hours with photographs, and we replace. Get whatever the answer is in writing.</p>

<h3>A fair comparison</h3>
<p>Put two quotations side by side against these nine points and the cheaper one is often cheaper for a reason you can now name. Sometimes it is genuinely better value — and now you can prove that too.</p>
<p><a href="/quote">Ask us for a line-by-line quote</a> · <a href="/certificates">See our compliance position</a></p>
`.trim(),
  },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.error('TURSO_DATABASE_URL is not set. Add it to .env.local and try again.');
    process.exit(1);
  }

  const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  await ensureSchema(db);

  let created = 0;
  let kept = 0;
  // space the publish dates a week apart so the blog does not look posted in one burst
  const start = Date.now() - POSTS.length * 7 * 24 * 60 * 60 * 1000;

  for (const [i, post] of POSTS.entries()) {
    const existing = (await db.execute({ sql: `SELECT slug FROM blog_posts WHERE slug = ?`, args: [post.slug] }))
      .rows[0];
    if (existing) {
      console.log(`  keep    ${post.slug} (already written)`);
      kept++;
      continue;
    }

    const stamp = new Date().toISOString();
    const publishedAt = new Date(start + i * 7 * 24 * 60 * 60 * 1000).toISOString();

    await db.execute({
      sql: `INSERT INTO blog_posts (id, title, slug, excerpt, cover, contentHtml, tags, status, publishedAt,
              author, readingMinutes, relatedProductSlugs, seo, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        post.title,
        post.slug,
        post.excerpt,
        JSON.stringify(post.cover),
        post.html,
        JSON.stringify(post.tags),
        publishedAt,
        'DecArt Team',
        readingMinutes(post.html),
        JSON.stringify(post.relatedProductSlugs),
        JSON.stringify(post.seo),
        stamp,
        stamp,
      ],
    });
    console.log(`  publish ${post.slug}  (${readingMinutes(post.html)} min read)`);
    created++;
  }

  console.log(`\n${created} published · ${kept} left as they are`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
