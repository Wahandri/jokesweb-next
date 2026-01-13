"use client";

import BeanHeadDefault, { BeanHead as BeanHeadNamed } from "beanheads";
import genBeanHeadConfig, {
    normalizeBeanHeadConfig,
} from "@/lib/genBeanHeadConfig";

const BeanHead = BeanHeadNamed ?? BeanHeadDefault;

export default function UserAvatar({
    username,
    avatarConfig,
    size = 40,
    className,
    shape = "circle",
}) {
    const name = username || "Usuario";

    const rawConfig =
        avatarConfig && Object.keys(avatarConfig).length > 0
            ? avatarConfig
            : genBeanHeadConfig(name);
    const config = normalizeBeanHeadConfig(rawConfig, name);

    const borderRadius =
        shape === "circle" ? "50%" : shape === "rounded" ? "12px" : "0px";

    return (
        <div
            className={className}
            style={{ width: size, height: size, borderRadius }}
        >
            <BeanHead
                {...config}
                mask={shape === "circle"}
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
}
