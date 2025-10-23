export function hasChanges(original, updated) {
    const ignoredFields = ["id", "createdAt", "updatedAt"];

    const clean = (obj) => {
        const clone = { ...obj };
        ignoredFields.forEach((f) => delete clone[f]);
        return clone;
    };

    const o = JSON.stringify(clean(original ?? {}));
    const u = JSON.stringify(clean(updated ?? {}));

    return o !== u;
}