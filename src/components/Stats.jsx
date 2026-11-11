import React from 'react';

const Stats = () => {
  const stats = [
    { value: '15,425', label: 'Sessions Hosted', desc: 'Active users running Warren-XMD.' },
    { value: '8,745', label: 'Active Groups', desc: 'Communities managed by the bot.' },
    { value: '235', label: 'Commands Executed', desc: 'Processed in real-time.' },
    { value: '99.9%', label: 'Uptime Guarantee', desc: 'Reliable self-reconnect loop.' },
  ];

  return (
    <section className="py-12 md:py-20 bg-gray-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Changed to grid-cols-2 for mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-4 md:p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-center items-center"
            >
              <h3 className="text-2xl md:text-5xl font-extrabold text-brand mb-1 md:mb-2">{stat.value}</h3>
              <p className="text-darktext font-bold text-[10px] md:text-sm mb-1 md:mb-3 uppercase tracking-wide">{stat.label}</p>
              <p className="text-graytext text-[10px] md:text-xs leading-tight md:leading-relaxed hidden sm:block">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
