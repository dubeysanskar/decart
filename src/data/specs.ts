/** Spec profiles — §7.3 of the build spec. Seeded onto products, editable per product in admin. */

export type SpecProfile =
  | 'imported'
  | 'leather-exec'
  | 'fabric-task'
  | 'mesh-ergo'
  | 'mesh-task'
  | 'visitor'
  | 'cafe'
  | 'table-cafe'
  | 'lounge'
  | 'sofa'
  | 'tandem'
  | 'training'
  | 'school'
  | 'auditorium'
  | 'desk'
  | 'desking'
  | 'table-conf'
  | 'storage'
  | 'institutional';

export type Spec = { label: string; value: string };

export const SPEC_PROFILES: Record<SpecProfile, Spec[]> = {
  'leather-exec': [
    { label: 'Type', value: 'High-back director chair' },
    { label: 'Tapestry', value: 'Twin-colour leatherette' },
    { label: 'Frame', value: 'Wooden ply frame with high-density PU foam & polyfill' },
    { label: 'Arms', value: 'Foam & polyfill cushioned arms' },
    { label: 'Mechanism', value: 'Torsion-bar auto-weight (knee-tilt on select models)' },
    { label: 'Base', value: 'Aluminium / chrome' },
    { label: 'Gas lift', value: '85 mm C-4 Samhongsa (65 mm on select models)' },
    { label: 'Castors', value: '60 mm pin wheel' },
  ],
  'mesh-ergo': [
    { label: 'Back', value: 'High-back special / dotted mesh' },
    { label: 'Armrests', value: '4D with PU pad (2D on select models)' },
    { label: 'Headrest', value: 'Adjustable' },
    { label: 'Lumbar', value: 'Adjustable lumbar support' },
    { label: 'Mechanism', value: 'Multi-lock weight mechanism' },
    { label: 'Seat', value: 'Eco-friendly seat with engineered PU moulded foam' },
    { label: 'Gas lift', value: 'C-4 Samhongsa' },
    { label: 'Base', value: 'Aluminium / chrome / nylon' },
    { label: 'Castors', value: '60 mm' },
  ],
  'mesh-task': [
    { label: 'Back', value: 'Mesh back with moulded-foam seat' },
    { label: 'Armrests', value: 'Fixed or height-adjustable' },
    { label: 'Mechanism', value: 'Swivel-tilt / centre-tilt' },
    { label: 'Gas lift', value: 'Class-4' },
    { label: 'Base', value: 'Nylon / chrome' },
    { label: 'Castors', value: '50–60 mm' },
  ],
  'fabric-task': [
    { label: 'Seat & back', value: 'Moulded-foam seat and back, fabric tapestry' },
    { label: 'Mechanism', value: 'Push-back / swivel-tilt' },
    { label: 'Gas lift', value: 'Class-4' },
    { label: 'Base', value: 'Nylon or powder-coated' },
  ],
  imported: [
    { label: 'Cushioning', value: 'Heavy-finish moulded PU foam' },
    { label: 'Mechanism', value: 'Donati' },
    { label: 'Gas lift', value: 'C-4 hydraulic' },
    { label: 'Base', value: 'Aluminium' },
    { label: 'Castors', value: 'PU silent' },
  ],
  visitor: [
    { label: 'Frame', value: 'Cantilever or four-leg, chrome or powder-coated' },
    { label: 'Back', value: 'Cushioned or mesh' },
    { label: 'Stacking', value: 'Stackable on select models' },
    { label: 'Use', value: 'Visitor, conference and waiting areas' },
  ],
  cafe: [
    { label: 'Shell', value: 'Moulded polypropylene or upholstered shell' },
    { label: 'Frame', value: 'Powder-coated steel / chrome / beech legs' },
    { label: 'Configuration', value: 'Chair and bar-stool heights' },
    { label: 'Use', value: 'Cafés, canteens and breakout floors' },
    { label: 'Customisation', value: 'Shell colour and frame finish to order' },
  ],
  'table-cafe': [
    { label: 'Top', value: 'Pre-laminated board, MDF or toughened glass' },
    { label: 'Base', value: 'Powder-coated steel column with weighted disc' },
    { label: 'Sizes', value: 'Round and square tops; café and bar heights' },
    { label: 'Customisation', value: 'Top finish and diameter to order' },
  ],
  lounge: [
    { label: 'Frame', value: 'Seasoned wood frame with webbing' },
    { label: 'Cushioning', value: 'High-density PU foam with polyfill top' },
    { label: 'Upholstery', value: 'Fabric or leatherette' },
    { label: 'Configuration', value: 'Single seaters, benches and pouffes' },
    { label: 'Customisation', value: 'Upholstery shade to order' },
  ],
  sofa: [
    { label: 'Frame', value: 'Seasoned wood frame with rubberised webbing' },
    { label: 'Cushioning', value: 'High-density PU foam, polyfill back cushions' },
    { label: 'Upholstery', value: 'Leatherette or fabric' },
    { label: 'Configuration', value: '1, 2 and 3 seaters — sold singly or as a set' },
    { label: 'Customisation', value: 'Shade and seat depth to order' },
  ],
  tandem: [
    { label: 'Beam', value: 'Powder-coated MS beam with levelling feet' },
    { label: 'Seats', value: '2, 3 and 4-seater configurations' },
    { label: 'Seat & back', value: 'PP moulded, cushioned or perforated steel' },
    { label: 'Use', value: 'Lobbies, waiting halls and terminals' },
  ],
  training: [
    { label: 'Frame', value: 'Powder-coated or chrome four-leg / cantilever' },
    { label: 'Options', value: 'Writing tablet-arm, book basket, stackable' },
    { label: 'Seat & back', value: 'Moulded PP or upholstered foam' },
    { label: 'Use', value: 'Training rooms, classrooms and seminar halls' },
  ],
  school: [
    { label: 'Frame', value: 'MS tube, powder-coated' },
    { label: 'Top', value: 'Pre-laminated board or moulded PP' },
    { label: 'Range', value: 'Desks, kids sets, library racks and lecterns' },
    { label: 'Sizes', value: 'Age-graded heights' },
    { label: 'Customisation', value: 'Institution branding and colour to order' },
  ],
  auditorium: [
    { label: 'Type', value: 'Fixed / floor-mounted auditorium seating' },
    { label: 'Seat', value: 'Auto-return tip-up seat with PU foam' },
    { label: 'Options', value: 'Writing pad, armrest tablet, aisle numbering' },
    { label: 'Configuration', value: 'Straight and curved rows, riser mounting' },
  ],
  desk: [
    { label: 'Top', value: 'Pre-laminated particle board (MDF / HDHMR / ply on request)' },
    { label: 'Construction', value: '25 + 12 mm top, 36 mm gable leg, 25/18 mm side storage' },
    { label: 'Standard sizes', value: '1500 / 1800 / 2100 / 2400 mm widths' },
    { label: 'Storage', value: 'Side unit with drawers and shutter' },
    { label: 'Customisation', value: 'Size, laminate and leg design to order' },
  ],
  desking: [
    { label: 'System', value: 'Linear desking with shared spine' },
    { label: 'Top', value: 'Pre-laminated board, 25 mm' },
    { label: 'Screens', value: 'Fabric-upholstered or acrylic-topped partitions' },
    { label: 'Cable management', value: 'Spine raceway with flip-top access' },
    { label: 'Customisation', value: 'Run length, seat count and finish to order' },
  ],
  'table-conf': [
    { label: 'Top', value: 'Pre-laminated board with post-formed edge' },
    { label: 'Base', value: 'Panel legs or MS powder-coated frame' },
    { label: 'Standard height', value: '750 mm' },
    { label: 'Options', value: 'Wire management box, flip-top power module' },
    { label: 'Customisation', value: 'Seat count and shape to order' },
  ],
  storage: [
    { label: 'Body', value: 'CRCA steel, powder-coated' },
    { label: 'Configuration', value: 'Full-height, low-height, lockers and filing' },
    { label: 'Locking', value: 'Multi-point lock with recessed handle' },
    { label: 'Shelving', value: 'Adjustable shelves' },
    { label: 'Customisation', value: 'Compartment count and shade to order' },
  ],
  institutional: [
    { label: 'Frame', value: 'MS tube, powder-coated' },
    { label: 'Configuration', value: 'Single and bunk formats' },
    { label: 'Deck', value: 'Perforated sheet or slatted deck' },
    { label: 'Finish', value: 'Anti-rust primer with epoxy powder coat' },
    { label: 'Customisation', value: 'Size and shade to order' },
  ],
};

/** Chair accessories, catalogue p.44 — PDP accordion on seating + Custom-chair dropdowns. */
export const BUILD_OPTIONS: { label: string; options: string[] }[] = [
  { label: 'Castors', options: ['50 mm fixed', '50 mm moveable', '60 mm fixed', '60 mm moveable'] },
  { label: 'Base', options: ['Nylon', 'PP', 'Chrome', 'Powder-coated'] },
  { label: 'Gas lift', options: ['65 mm', '85 mm', '100 mm', '120 mm'] },
  { label: 'Armrests', options: ['Fixed', 'Height-adjustable', '2D', '3D'] },
  { label: 'Mechanism', options: ['Swivel tilt', 'Knee tilt', 'Torsion bar', 'Push back'] },
];

/** Finishes, catalogue p.67 — furniture families. */
export const FINISHES = {
  laminates: ['Beech', 'Maple', 'Teak', 'Walnut', 'Oak', 'Wenge'],
  powderCoats: [
    { name: 'Black', hex: '#1B1B1B' },
    { name: 'Ivory', hex: '#EFE7D6' },
    { name: 'White', hex: '#FAFAFA' },
    { name: 'Chocolate Brown', hex: '#4A3229' },
    { name: 'Moon Grey', hex: '#B9BDC1' },
    { name: 'Silver Grey', hex: '#8E969D' },
    { name: 'Bone Grey', hex: '#D5D2CA' },
    { name: 'D.A. Grey', hex: '#5B6167' },
  ],
};
