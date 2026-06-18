export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Kontaktirajte <span className="text-[#C41230]">Nas</span></h1>
        <p className="text-gray-400 mb-12">Tu smo za sva vaša pitanja i sugestije</p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C41230]/20 flex items-center justify-center text-[#C41230] text-xl flex-shrink-0">📍</div>
              <div>
                <h3 className="font-bold mb-1">Adresa</h3>
                <p className="text-gray-400">Sportska Dvorana "Morača"<br />Podgorica, Crna Gora</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C41230]/20 flex items-center justify-center text-[#C41230] text-xl flex-shrink-0">📧</div>
              <div>
                <h3 className="font-bold mb-1">Email</h3>
                <p className="text-gray-400">info@zrklavice.me</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C41230]/20 flex items-center justify-center text-[#C41230] text-xl flex-shrink-0">📞</div>
              <div>
                <h3 className="font-bold mb-1">Telefon</h3>
                <p className="text-gray-400">+382 XX XXX XXX</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Pošaljite Poruku</h2>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <input type="text" placeholder="Vaše ime" className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C41230]" />
              <input type="email" placeholder="Email adresa" className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C41230]" />
              <textarea rows={5} placeholder="Vaša poruka..." className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C41230] resize-none" />
              <button type="submit" className="w-full bg-[#C41230] hover:bg-[#a00f28] text-white font-bold py-3 rounded-lg transition-colors">
                Pošaljite Poruku
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
