const teamImageFolders: Record<string, string> = {
    CSF_AJU: "argentina",
    CSF_BGR: "argentina",
    CSF_BOJ: "argentina",
    CSF_DEF: "argentina",
    CSF_ELP: "argentina",
    CSF_LAN: "argentina",
    CSF_RAC: "argentina",
    CSF_RIV: "argentina",
    CSF_RSC: "argentina",
    CSF_SLO: "argentina",
    CSF_TAL: "argentina",
    CSF_CCD: "argentina",
    CSF_GOD: "argentina",
    CSF_HUR: "argentina",
    CSF_IND: "argentina",
    CSF_BAR: "argentina",
    CSF_IRV: "argentina",
    CSF_PLA: "argentina",
    CSF_RIE: "argentina",
    CSF_TIG: "argentina",
    CSF_USF: "argentina",
    CSF_VEL: "argentina",
    CSF_ALR: "bolivia",
    CSF_BLV: "bolivia",
    CSF_NPT: "bolivia",
    CSF_RTP: "bolivia",
    CSF_THS: "bolivia",
    CSF_GVS: "bolivia",
    CSF_BLO: "bolivia",
    CSF_IPE: "bolivia",
    CSF_SAB: "bolivia",
    CSF_APR: "brasil",
    CSF_ATM: "brasil",
    CSF_BOT: "brasil",
    CSF_CEC: "brasil",
    CSF_COR: "brasil",
    CSF_CZO: "brasil",
    CSF_FLA: "brasil",
    CSF_FLU: "brasil",
    CSF_FOR: "brasil",
    CSF_GRE: "brasil",
    CSF_INL: "brasil",
    CSF_PAL: "brasil",
    CSF_RBB: "brasil",
    CSF_SAO: "brasil",
    CSF_BAH: "brasil",
    CSF_MIR: "brasil",
    CSF_SAN: "brasil",
    CSF_VAS: "brasil",
    CSF_VIT: "brasil",
    CSF_CCO: "chile",
    CSF_COB: "chile",
    CSF_CQU: "chile",
    CSF_HUA: "chile",
    CSF_PST: "chile",
    CSF_ULC: "chile",
    CSF_DIQ: "chile",
    CSF_AUD: "chile",
    CSF_OHI: "chile",
    CSF_UCH: "chile",
    CSF_UES: "chile",
    CSF_AZP: "colombia",
    CSF_IME: "colombia",
    CSF_JUN: "colombia",
    CSF_MIL: "colombia",
    CSF_ABU: "colombia",
    CSF_ADC: "colombia",
    CSF_ATN: "colombia",
    CSF_DTL: "colombia",
    CSF_ONC: "colombia",
    CSF_SFE: "colombia",
    CSF_BNA: "ecuador",
    CSF_DEL: "ecuador",
    CSF_IDL: "ecuador",
    CSF_LDU: "ecuador",
    CSF_DCU: "ecuador",
    CSF_MAC: "ecuador",
    CSF_UCA: "ecuador",
    CSF_MUR: "ecuador",
    CSF_CEP: "paraguay",
    CSF_LIB: "paraguay",
    CSF_NAL: "paraguay",
    CSF_SLQ: "paraguay",
    CSF_SPA: "paraguay",
    CSF_STN: "paraguay",
    CSF_GUA: "paraguay",
    CSF_OLI: "paraguay",
    CSF_REC: "paraguay",
    CSF_ALI: "peru",
    CSF_CVA: "peru",
    CSF_DGC: "peru",
    CSF_UNI: "peru",
    CSF_AGR: "peru",
    CSF_AAT: "peru",
    CSF_CIE: "peru",
    CSF_CUS: "peru",
    CSF_MEL: "peru",
    CSF_SCR: "peru",
    CSF_DAN: "uruguay",
    CSF_LIV: "uruguay",
    CSF_NCI: "uruguay",
    CSF_PEN: "uruguay",
    CSF_RCG: "uruguay",
    CSF_BOR: "uruguay",
    CSF_CEL: "uruguay",
    CSF_JUV: "uruguay",
    CSF_MCT: "uruguay",
    CSF_CRC: "venezuela",
    CSF_DTA: "venezuela",
    CSF_MTP: "venezuela",
    CSF_RYZ: "venezuela",
    CSF_APC: "venezuela",
    CSF_CBO: "venezuela",
    CSF_DLG: "venezuela",
    CSF_UCV: "venezuela",
};

const countryCalendarFileNames: Record<string, string> = {
    AlianzaColombia: "Alianza",
    NacionalParaguay: "Nacional",
    RacingUruguay: "Racing",
};

export function getTeamImageFolder(imageName?: string | null) {
    if (!imageName) return null;

    const imageCode = imageName.replace(/\.[^.]+$/, "");
    return teamImageFolders[imageCode] ?? null;
}

export function getTeamImagePath(imageName: string) {
    const folder = getTeamImageFolder(imageName);
    return folder ? `${folder}/${imageName}` : `icons/${imageName}`;
}

export function getCalendarFilePath(
    type: string,
    path: string,
    tournament: string,
    imageName?: string | null,
    year?: string,
) {
    if (type === "team") {
        const folder = getTeamImageFolder(imageName);
        const fileName = countryCalendarFileNames[path] ?? path;
        return folder ? `${folder}/${fileName}.ics` : `${tournament}/${path}.ics`;
    }

    if (type === "country") {
        return `${path}.ics`;
    }

    if (type === "group" && year) {
        return `${tournament}/${year}/${path}.ics`;
    }

    return `${tournament}/${path}.ics`;
}
