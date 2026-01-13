"use client";

import Avatar, { genConfig } from "react-nice-avatar";

export default function UserAvatar({
    username,
    avatarConfig,
    size = 40,
    className,
    shape = "circle",
}) {
    const name = username || "Usuario";

    const config =
        avatarConfig && Object.keys(avatarConfig).length > 0
            ? avatarConfig
            : genConfig(name);

    return (
        <Avatar
            className={className}
            style={{ width: size, height: size }}
            shape={shape}
            {...config}
        />
    );
}
