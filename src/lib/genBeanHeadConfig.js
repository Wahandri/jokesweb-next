const ACCESSORY_OPTIONS = [
    "none",
    "eyepatch",
    "roundGlasses",
    "tinyGlasses",
    "shades",
];

const BODY_OPTIONS = ["chest", "breasts"];

const CLOTHING_OPTIONS = [
    "naked",
    "shirt",
    "dressShirt",
    "vneck",
    "tankTop",
    "dress",
];

const CLOTHING_COLOR_OPTIONS = [
    "black",
    "blue",
    "gray",
    "green",
    "heather",
    "navy",
    "pink",
    "red",
    "white",
];

const EYEBROWS_OPTIONS = [
    "raised",
    "leftLowered",
    "serious",
    "angry",
    "concerned",
];

const EYES_OPTIONS = [
    "normal",
    "leftTwitch",
    "happy",
    "content",
    "squint",
    "simple",
    "dizzy",
    "wink",
    "heart",
];

const FACIAL_HAIR_OPTIONS = [
    "none",
    "chin",
    "full",
    "fullMajestic",
    "goatee",
    "chevron",
    "soulPatch",
    "mustache",
];

const GRAPHIC_OPTIONS = [
    "none",
    "redwood",
    "gatsby",
    "vue",
    "react",
    "graphQL",
];

const HAIR_OPTIONS = [
    "none",
    "long",
    "bun",
    "short",
    "pixie",
    "balding",
    "buzz",
    "afro",
    "bob",
    "mohawk",
];

const HAIR_COLOR_OPTIONS = ["black", "brown", "blonde", "red", "gray", "white"];

const HAT_OPTIONS = ["none", "beanie", "turban", "party", "topHat", "fedora"];

const HAT_COLOR_OPTIONS = [...CLOTHING_COLOR_OPTIONS];

const LIP_COLOR_OPTIONS = ["red", "pink", "purple", "green", "blue", "brown", "black"];

const MOUTH_OPTIONS = ["smile", "open", "serious", "lips", "sad", "grin"];

const SKIN_TONE_OPTIONS = ["light", "yellow", "brown", "dark", "red", "black"];

const CIRCLE_COLOR_OPTIONS = [
    "#F9C9B6",
    "#F4B7B2",
    "#E0F4FF",
    "#FFD8A8",
    "#C1E1C1",
    "#EAD7C1",
    "#CDB4DB",
    "#BDE0FE",
    "#FFC8DD",
];

const LEGACY_BODY_MAP = {
    man: "chest",
    woman: "breasts",
};

const LEGACY_HAIR_MAP = {
    normal: "short",
    thick: "afro",
    mohawk: "mohawk",
    womanLong: "long",
    womanShort: "bob",
};

const LEGACY_ACCESSORY_MAP = {
    none: "none",
    round: "roundGlasses",
    square: "tinyGlasses",
};

const LEGACY_CLOTHING_MAP = {
    hoody: "shirt",
    short: "vneck",
    polo: "dressShirt",
};

const LEGACY_SHAPE_MAP = {
    circle: true,
    rounded: false,
    square: false,
};

const LEGACY_COLOR_MAP = {
    "#000000": "black",
    "#ffffff": "white",
    "#92a1c6": "blue",
    "#92A1C6": "blue",
};

const BEANHEAD_KEYS = [
    "body",
    "hair",
    "hairColor",
    "clothing",
    "clothingColor",
    "accessory",
    "eyebrows",
    "eyes",
    "facialHair",
    "graphic",
    "hat",
    "hatColor",
    "lashes",
    "lipColor",
    "mask",
    "faceMask",
    "mouth",
    "skinTone",
    "circleColor",
];

const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return hash >>> 0;
};

const mulberry32 = (seed) => {
    let t = seed;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
};

const pick = (rng, options) => options[Math.floor(rng() * options.length)];

const isHexColor = (value) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);

const mapLegacyColor = (value, fallback) => {
    if (!value || typeof value !== "string") {
        return fallback;
    }
    if (LEGACY_COLOR_MAP[value]) {
        return LEGACY_COLOR_MAP[value];
    }
    return fallback;
};

const genBeanHeadConfig = (name = "Usuario") => {
    const safeName = name && name.trim().length > 0 ? name.trim() : "Usuario";
    const rng = mulberry32(hashString(safeName));

    return {
        base: true, // Required by BeanHead
        body: pick(rng, BODY_OPTIONS),
        hair: pick(rng, HAIR_OPTIONS),
        hairColor: pick(rng, HAIR_COLOR_OPTIONS),
        clothing: pick(rng, CLOTHING_OPTIONS),
        clothingColor: pick(rng, CLOTHING_COLOR_OPTIONS),
        accessory: pick(rng, ACCESSORY_OPTIONS),
        eyebrows: pick(rng, EYEBROWS_OPTIONS),
        eyes: pick(rng, EYES_OPTIONS),
        facialHair: pick(rng, FACIAL_HAIR_OPTIONS),
        graphic: pick(rng, GRAPHIC_OPTIONS),
        hat: pick(rng, HAT_OPTIONS),
        hatColor: pick(rng, HAT_COLOR_OPTIONS),
        lashes: pick(rng, [true, false]),
        lipColor: pick(rng, LIP_COLOR_OPTIONS),
        mask: pick(rng, [true, false]),
        faceMask: pick(rng, [true, false]),
        mouth: pick(rng, MOUTH_OPTIONS),
        skinTone: pick(rng, SKIN_TONE_OPTIONS),
        circleColor: pick(rng, CIRCLE_COLOR_OPTIONS),
    };
};

const normalizeBeanHeadConfig = (config, name) => {
    if (!config || typeof config !== "object") {
        return genBeanHeadConfig(name);
    }

    const hasBeanHeadKey = BEANHEAD_KEYS.some((key) => key in config);
    if (hasBeanHeadKey) {
        return { ...genBeanHeadConfig(name), ...config };
    }

    const base = genBeanHeadConfig(name);
    const next = { ...base };

    if (config.sex && LEGACY_BODY_MAP[config.sex]) {
        next.body = LEGACY_BODY_MAP[config.sex];
    }
    if (config.hairStyle && LEGACY_HAIR_MAP[config.hairStyle]) {
        next.hair = LEGACY_HAIR_MAP[config.hairStyle];
    }
    if (config.glassesStyle && LEGACY_ACCESSORY_MAP[config.glassesStyle]) {
        next.accessory = LEGACY_ACCESSORY_MAP[config.glassesStyle];
    }
    if (config.shirtStyle && LEGACY_CLOTHING_MAP[config.shirtStyle]) {
        next.clothing = LEGACY_CLOTHING_MAP[config.shirtStyle];
    }

    if (config.hairColor) {
        next.hairColor = mapLegacyColor(config.hairColor, base.hairColor);
    }
    if (config.shirtColor) {
        next.clothingColor = mapLegacyColor(config.shirtColor, base.clothingColor);
    }
    if (config.bgColor && isHexColor(config.bgColor)) {
        next.circleColor = config.bgColor;
    }
    if (config.shape && config.shape in LEGACY_SHAPE_MAP) {
        next.mask = LEGACY_SHAPE_MAP[config.shape];
    }

    return next;
};

export {
    ACCESSORY_OPTIONS,
    BODY_OPTIONS,
    CLOTHING_OPTIONS,
    CLOTHING_COLOR_OPTIONS,
    EYEBROWS_OPTIONS,
    EYES_OPTIONS,
    FACIAL_HAIR_OPTIONS,
    GRAPHIC_OPTIONS,
    HAIR_OPTIONS,
    HAIR_COLOR_OPTIONS,
    HAT_OPTIONS,
    HAT_COLOR_OPTIONS,
    LIP_COLOR_OPTIONS,
    MOUTH_OPTIONS,
    SKIN_TONE_OPTIONS,
    CIRCLE_COLOR_OPTIONS,
    normalizeBeanHeadConfig,
};

export default genBeanHeadConfig;
