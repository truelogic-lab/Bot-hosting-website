import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      num: '1',
      title: 'Enter Number',
      desc: 'Provide your WhatsApp number with the country code.',
    },
    {
      num: '2',
      title: 'Get Pairing Code',
      desc: 'Receive a secure 8-character code instantly.',
    },
    {
      num: '3',
      title: 'Link WhatsApp',
      desc: 'Enter the code in WhatsApp Linked Devices.',
    },
    {
      num: '4',
      title: 'Bot is Live',
      desc: 'Your Warren-XMD bot is now ready to use 24/7.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
            Easy Steps
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-darktext mb-4">
            How It Works
          </h2>
          <p className="text-graytext text-sm md:text-base max-w-xl mx-auto">
            Getting your bot online takes less than a minute. Follow these simple steps to pair and deploy your Warren-XMD instance.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          
          {/* Connecting Line (Desktop only) */}
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-0"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center z-10 group">
              {/* Number Badge */}
              <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold mb-6 shadow-lg shadow-brand/30 border-4 border-white group-hover:scale-110 transition-transform duration-300">
                {step.num}
              </div>
              
              <h3 className="text-lg font-bold text-darktext mb-2">{step.title}</h3>
              <p className="text-sm text-graytext leading-relaxed max-w-[220px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
