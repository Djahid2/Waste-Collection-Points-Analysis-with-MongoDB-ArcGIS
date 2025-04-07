const binFrequency = {
    DAILY : 'DAILY',
    WEEKLY : 'WEEKLY',
    MONTHLY : 'MONTHLY',
    YEARLY : 'YEARLY',
    ONETIME : 'ONETIME'
}

const binStatus ={
    SATURATEd : 'T',
    PARTIALLY_FULL : 'F'
}

const isOneway = {
    YES : 'T',
    NO : 'F',
    explicit : 'B',
}

const isBridge = {
    YES : 'T',
    NO : 'F',
}

const isTunnel = {
    YES : 'T',
    NO : 'F',
}

const roadType = {
    BUSWAY: 'busway',
    CYCLEWAY: 'cycleway',
    FOOTWAY: 'footway',
    MOTORWAY: 'motorway',
    MOTORWAY_LINK: 'motorway_link',
    PATH: 'path',
    PEDESTRIAN: 'pedestrian',
    PRIMARY: 'primary',
    PRIMARY_LINK: 'primary_link',
    RESIDENTIAL: 'residential',
    SECONDARY: 'secondary',
    SECONDARY_LINK: 'secondary_link',
    SERVICE: 'service',
    STEPS: 'steps',
    TERTIARY: 'tertiary',
    TERTIARY_LINK: 'tertiary_link',
    TRACK: 'track',
    TRUNK: 'trunk',
    TRUNK_LINK: 'trunk_link',
    UNCLASSIFIED: 'unclassified'
};

export {
    binFrequency,
    roadType,
    binStatus,
    isOneway,
    isBridge,
    isTunnel
};