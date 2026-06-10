export function withCalendarSubscriptionName(link: string, name: string) {
    return link.replace("name=Uruguay", `name=${encodeURIComponent(name)}`);
}
