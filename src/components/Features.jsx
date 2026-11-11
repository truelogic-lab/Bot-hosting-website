import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const menuText = `╭━━━━━━〔 ʙᴏᴛ ɪɴғᴏ 〕━━━━━━
│ ◉ ɴᴀᴍᴇ: WARREN-XMD
│ ◉ ᴏᴡɴᴇʀ: Warren
│ ◉ ᴍᴏᴅᴇ: PUBLIC
│ ◉ ᴄᴏᴍᴍᴀɴᴅs: 64
│ ◉ ᴜᴘᴛɪᴍᴇ: 1h 18m 2s
│ ◉ ᴠᴇʀsɪᴏɴ: 1.0.0
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴍᴀɪɴ 〕━━━━━━
│ ◉ ➤ ping
│ ◉ ➤ menu
│ ◉ ➤ mode
│ ◉ ➤ repo
│ ◉ ➤ botname
│ ◉ ➤ description
│ ◉ ➤ botdp
│ ◉ ➤ reactemojis
│ ◉ ➤ owneremojis
│ ◉ ➤ join
│ ◉ ➤ owner
│ ◉ ➤ prefix
│ ◉ ➤ update
│ ◉ ➤ restart
│ ◉ ➤ settings
│ ◉ ➤ broadcast
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴛᴏᴏʟs 〕━━━━━━
│ ◉ ➤ vv
│ ◉ ➤ img
│ ◉ ➤ calc
│ ◉ ➤ take
│ ◉ ➤ story
│ ◉ ➤ react
│ ◉ ➤ toimg
│ ◉ ➤ ssweb
│ ◉ ➤ setdp
│ ◉ ➤ getdp
│ ◉ ➤ sticker
│ ◉ ➤ morning
│ ◉ ➤ birthday
│ ◉ ➤ autoview
│ ◉ ➤ tts
│ ◉ ➤ autobio
│ ◉ ➤ autopost
│ ◉ ➤ anticall
│ ◉ ➤ autoreact
│ ◉ ➤ autostatus
│ ◉ ➤ autoreply
│ ◉ ➤ statusreact
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 sᴇᴀʀᴄʜ & ᴀɪ 〕━━━━━━
│ ◉ ➤ ai
│ ◉ ➤ gpt
│ ◉ ➤ 8ball
│ ◉ ➤ imagine
│ ◉ ➤ dare
│ ◉ ➤ rate
│ ◉ ➤ truth
│ ◉ ➤ lyrics
│ ◉ ➤ weather
│ ◉ ➤ igstalk
│ ◉ ➤ githubstalk
│ ◉ ➤ compatibility
│ ◉ ➤ tiktokstalk
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴅᴏᴡɴʟᴏᴀᴅ 〕━━━━━━
│ ◉ ➤ play
│ ◉ ➤ tiktok
│ ◉ ➤ instagram
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs 〕━━━━━━
│ ◉ ➤ tag
│ ◉ ➤ link
│ ◉ ➤ gcpp
│ ◉ ➤ mute
│ ◉ ➤ poll
│ ◉ ➤ ginfo
│ ◉ ➤ revoke
│ ◉ ➤ unmute
│ ◉ ➤ tagall
│ ◉ ➤ chvote
│ ◉ ➤ welcome
│ ◉ ➤ setwelcome
│ ◉ ➤ goodbye
│ ◉ ➤ setgoodbye
│ ◉ ➤ gcstatus
│ ◉ ➤ updategname
│ ◉ ➤ updategdesc
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ɢʀᴏᴜᴘ ᴀᴄᴛɪᴏɴs 〕━━━━━━
│ ◉ ➤ add
│ ◉ ➤ end
│ ◉ ➤ out
│ ◉ ➤ topactive
│ ◉ ➤ kick
│ ◉ ➤ accept
│ ◉ ➤ reject
│ ◉ ➤ invite
│ ◉ ➤ newgc
│ ◉ ➤ demote
│ ◉ ➤ promote
│ ◉ ➤ requests
│ ◉ ➤ acceptall
│ ◉ ➤ rejectall
│ ◉ ➤ antilink
│ ◉ ➤ antidelete
│ ◉ ➤ antiedit
│ ◉ ➤ antistatusmention
╰━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━〔 ᴇᴍᴏᴊɪ ᴇғғᴇᴄᴛs 〕━━━━━━
│ ◉ ➤ cry
│ ◉ ➤ hot
│ ◉ ➤ hug
│ ◉ ➤ joy
│ ◉ ➤ moon
│ ◉ ➤ pat
│ ◉ ➤ sad
│ ◉ ➤ shy
│ ◉ ➤ sus
│ ◉ ➤ wave
│ ◉ ➤ wink
│ ◉ ➤ bite
│ ◉ ➤ cool
│ ◉ ➤ dare
│ ◉ ➤ flip
│ ◉ ➤ hate
│ ◉ ➤ joke
│ ◉ ➤ kiss
│ ◉ ➤ lick
│ ◉ ➤ love
│ ◉ ➤ nerd
│ ◉ ➤ pick
│ ◉ ➤ poke
│ ◉ ➤ poor
│ ◉ ➤ rich
│ ◉ ➤ roll
│ ◉ ➤ slap
│ ◉ ➤ slow
│ ◉ ➤ smug
│ ◉ ➤ tail
│ ◉ ➤ yeet
│ ◉ ➤ blush
│ ◉ ➤ bonk
│ ◉ ➤ bruh
│ ◉ ➤ clap
│ ◉ ➤ faint
│ ◉ ➤ fancy
│ ◉ ➤ flag
│ ◉ ➤ fast
│ ◉ ➤ kill
│ ◉ ➤ laugh
│ ◉ ➤ lucky
│ ◉ ➤ pray
│ ◉ ➤ sick
│ ◉ ➤ slam
│ ◉ ➤ weak
│ ◉ ➤ angry
│ ◉ ➤ bored
│ ◉ ➤ crush
│ ◉ ➤ cuddle
│ ◉ ➤ dance
│ ◉ ➤ dumb
│ ◉ ➤ happy
│ ◉ ➤ heart
│ ◉ ➤ hungry
│ ◉ ➤ nerdy
│ ◉ ➤ proud
│ ◉ ➤ smart
│ ◉ ➤ tired
│ ◉ ➤ brain
│ ◉ ➤ brave
│ ◉ ➤ calm
│ ◉ ➤ clumsy
│ ◉ ➤ confused
│ ◉ ➤ cringe
│ ◉ ➤ dream
│ ◉ ➤ grumpy
│ ◉ ➤ honest
│ ◉ ➤ humble
│ ◉ ➤ jealous
│ ◉ ➤ kind
│ ◉ ➤ lazy
│ ◉ ➤ lonely
│ ◉ ➤ mystic
│ ◉ ➤ nervous
│ ◉ ➤ polite
│ ◉ ➤ quiet
│ ◉ ➤ sassy
│ ◉ ➤ silly
│ ◉ ➤ sleepy
│ ◉ ➤ strong
│ ◉ ➤ stupid
│ ◉ ➤ sweat
│ ◉ ➤ thankful
│ ◉ ➤ thirsty
│ ◉ ➤ tickle
│ ◉ ➤ unlucky
│ ◉ ➤ weird
│ ◉ ➤ win
│ ◉ ➤ worry
╰━━━━━━━━━━━━━━━━━━━━━━━

> *⚡ Warren-ᴍᴅ | Powered by Warren | ꜱᴘᴇᴇᴅ: 0ᴍꜱ 🔥*`;

const Features = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(menuText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          
          {/* Left Side: Marketing Copy */}
          <div className="max-w-xl text-center lg:text-left order-2 lg:order-1">
            <div className="inline-block bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
              Core Features
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-darktext leading-tight mb-6">
              Over 64+ powerful commands <br className="hidden md:block" />
              built for <span className="text-brand">maximum control</span>.
            </h2>
            <p className="text-graytext text-sm md:text-base mb-8 leading-relaxed">
              From advanced group management and anti-delete security to AI-powered chats and media downloaders—Warren-XMD handles it all. Here is a live preview of your future menu.
            </p>

            <ul className="space-y-4 text-left inline-block">
              <li className="flex items-center gap-3">
                <div className="bg-brand/10 p-1.5 rounded-full"><span className="text-brand text-xs font-bold">✓</span></div>
                <span className="text-darktext font-medium text-sm md:text-base">Full Group Moderation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-brand/10 p-1.5 rounded-full"><span className="text-brand text-xs font-bold">✓</span></div>
                <span className="text-darktext font-medium text-sm md:text-base">AI, Stalkers & Downloaders</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-brand/10 p-1.5 rounded-full"><span className="text-brand text-xs font-bold">✓</span></div>
                <span className="text-darktext font-medium text-sm md:text-base">Auto-View & Anti-Delete</span>
              </li>
            </ul>
          </div>

          {/* Right Side: The Actual Menu Preview */}
          <div className="relative w-full flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#252525] border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-xs text-gray-400 font-mono">warren-xmd ~ menu</span>
                </div>
                
                {/* Copy Button */}
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-md"
                >
                  {isCopied ? (
                    <><Check size={14} className="text-green-400" /> <span className="text-green-400">Copied!</span></>
                  ) : (
                    <><Copy size={14} /> Copy Menu</>
                  )}
                </button>
              </div>

              {/* Terminal Body */}
              <div className="p-4 md:p-6 h-[450px] md:h-[550px] overflow-y-auto custom-scrollbar">
                <pre className="text-[11px] md:text-xs leading-tight text-[#e0e0e0] font-mono whitespace-pre">
                  {menuText}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
