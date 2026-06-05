'use server'

export async function getDiscordAvatar(discordId: string) {
  try {
    const res = await fetch(`https://gatecord.com/wp-json/discord/profile/${discordId}`, { 
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.avatar) {
        return `https://cdn.discordapp.com/avatars/${discordId}/${data.avatar}.png?size=128`;
      }
    }
  } catch (e) {}
  
  // Return the default discord avatar fallback
  return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordId) >> BigInt(22)) % 6}.png`;
}
