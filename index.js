export class FatalError extends Error {
    constructor(message) {
        super(message);
    }
}

export function fitSize(imageSize, aspectRatio) {
    const [w, h] = imageSize.split(":");
    if (w === "auto") {
        const target = parseInt(h);
        return { height: target, width: Math.ceil(target * aspectRatio) };
    }

    if (h === "auto") {
        const target = parseInt(w);
        return { width: target, height: Math.ceil(target * aspectRatio) };
    }

    throw new FatalError(`Wrong image size format: ${imageSize}`);
}

class ArtWorks {

    options = {};
    constructor(options) {
        this.options = options;
    }

    getUrl(path) {
        const { baseUrl } = this.options;
        return `${baseUrl}/api/v3/${path}`;
    }

    async createTask(payload) {
        const auth = { username, password };

        try {
            const response = await httpClient({
                method: "post",
                url: getUrl("tasks"),
                headers: {
                    "Content-type": "application/json",
                },
                auth,
                data: JSON.stringify(payload),
            });
            const {
                id
            } = response.data;
            return id;
        } catch (e) {
            const {
                errors
            } = e.response?.data;
            if (errors?.length > 0) {
                throw new FatalError(errors.join(", "));
            }
            throw new FatalError(e.statusText);
        }
    }

    async cancelTask(id) {
        const auth = { username, password };
        console.debug(`Cancel task ${id}`);
        try {
            await httpClient({
                method: "post",
                url: getUrl(`tasks/${id}/cancel`),
                headers: {
                    "Content-type": "application/json",
                },
                auth
            });
        } catch (e) {
            const {
                errors
            } = e.response?.data;
            if (errors?.length > 0) {
                throw new FatalError(errors.join(", "));
            }
            throw new FatalError(e.statusText);
        }
    }

    async checkState(id) {
        const auth = { username, password };

        const {
            data
        } = await httpClient({
            method: "get",
            url: getUrl(`tasks/${id}`),
            headers: {
                "Content-type": "application/json",
            },
            auth
        });

        const {
            status,
            results
        } = data;
        switch (status) {
            case "preparing":
            case "scheduling":
            case "scheduled":
            case "pending":
            case "processing":
                return null;
            case "completed":
                const {
                    data
                } = results;
                return data;
            case "failed":
                const {
                    error
                } = results;
                throw new FatalError(error);
            default:
                throw new FatalError("Wrong task status");
        }
    }
}

module.exports = {
    FatalError,
    ArtWorks,
    fitSize,
}
