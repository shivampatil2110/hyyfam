import { showToast } from "@/components/Toast/Toast";

export function copyToClipboard(text: string) {
    return new Promise((resolve, reject) => {
        // Check if we can use the newer Navigator Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    showToast({
                        message: "Link copied!",
                        type: "success",
                    });
                    resolve(true);
                })
                .catch((err) => {
                    showToast({
                        message: "Failed to copy link!",
                        type: "error",
                    });
                    reject(err);
                });
        } else {
            // Fallback for older browsers
            try {
                // Create a temporary textarea element
                const textArea = document.createElement("textarea");

                // Set its value to the text we want to copy
                textArea.value = text;

                // Make it invisible
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";

                // Add it to the DOM
                document.body.appendChild(textArea);

                // Select the text
                textArea.focus();
                textArea.select();

                // Execute the copy command
                const successful = document.execCommand("copy");

                // Remove the temporary element
                document.body.removeChild(textArea);

                if (successful) {
                    showToast({
                        message: "Link copied!",
                        type: "success",
                    });
                    resolve(true);
                } else {
                    showToast({
                        message: "Failed to copy link!",
                        type: "error",
                    });
                    resolve(false);
                }
            } catch (err) {
                showToast({
                    message: "Failed to copy link!",
                    type: "error",
                });
                reject(err);
            }
        }
    });
}

export const handleShare = async (link: string) => {
    if (navigator.share) {
        try {
            copyToClipboard(link)
            await navigator.share({
                title: 'Check this out!',
                text: 'Hey, check out this link!',
                url: link,
            });
        } catch (error) {
            // copyToClipboard(link)
        }
    } else {
        copyToClipboard(link)
    }
};

export const checkURL = async (link: string) => {
    try {
        new URL(link)
        return true
    } catch (error) {
        return false
    }
}

export function getPIDFromLink(url: string) {
    try {
        const parsedUrl = new URL(url);

        const pidFromQuery = parsedUrl.searchParams.get('pid');
        if (pidFromQuery) return pidFromQuery;

        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        for (let i = 0; i < pathParts.length; i++) {
            if ((pathParts[i] === 'product' || pathParts[i] === 'p') && pathParts[i + 1]) {
                return pathParts[i + 1];
            }
        }

        const lastSegment = pathParts[pathParts.length - 1];
        if (/^\d+$/.test(lastSegment)) return lastSegment;

        return null;
    } catch (error) {
        return null;
    }
}
