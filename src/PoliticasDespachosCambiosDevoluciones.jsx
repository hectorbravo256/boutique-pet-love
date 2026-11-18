import { Helmet } from "react-helmet-async";
import { Truck, Clock3, RefreshCcw, ShieldCheck, MapPin, PackageCheck, MessageCircle, ChevronRight } from "lucide-react";

const sections = [
  { id: "cobertura", label: "Despachos y cobertura", icon: Truck },
  { id: "horarios", label: "Horarios de despacho", icon: Clock3 },
  { id: "cambios", label: "Cambios de talla", icon: RefreshCcw },
  { id: "devoluciones", label: "Devoluciones y garantías", icon: ShieldCheck },
];

const schedule = [
  { day: "Lunes", before: "Martes", after: "Miércoles" },
  { day: "Martes", before: "Miércoles", after: "Jueves" },
  { day: "Miércoles", before: "Jueves", after: "Viernes" },
  { day: "Jueves", before: "Viernes", after: "Lunes" },
  { day: "Viernes", before: "Lunes", after: "Lunes" },
  { day: "Sábado", before: "Lunes", after: "Lunes" },
  { day: "Domingo", before: "Lunes", after: "Martes" },
];

function Section({ id, number, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm md:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-sm font-black text-pink-700">{number}</span>
        <h2 className="text-xl font-black text-gray-900 md:text-2xl">{title}</h2>
      </div>
      <div className="space-y-4 text-sm leading-7 text-gray-700 md:text-base">{children}</div>
    </section>
  );
}

export default function PoliticasDespachosCambiosDevoluciones() {
  return (
    <main className="min-h-screen bg-pink-50 px-4 py-8 md:px-6 md:py-12">
      <Helmet>
        <title>Políticas de Despachos, Cambios y Devoluciones | Boutique Pet Love</title>
        <meta name="description" content="Conoce las políticas de despacho a domicilio, cambios de talla, devoluciones, retracto y garantía legal de Boutique Pet Love." />
        <link rel="canonical" href="https://boutiquepetlove.cl/politicas-de-despachos-cambios-y-devoluciones" />
      </Helmet>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-3xl bg-gradient-to-br from-pink-600 to-fuchsia-600 px-6 py-9 text-white shadow-lg md:px-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-pink-100">Boutique Pet Love · Información para clientes</p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight md:text-4xl">Políticas de Despachos, Cambios y Devoluciones</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-pink-50 md:text-base">Encuentra aquí cómo enviamos tus compras, cómo solicitar un cambio de talla y cuáles son tus derechos como consumidor.</p>
        </header>

        <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white p-4 font-semibold text-gray-800 shadow-sm transition hover:border-pink-300 hover:text-pink-700">
              <Icon className="h-5 w-5 shrink-0 text-pink-600" aria-hidden="true" />
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </a>
          ))}
        </div>

        <div className="space-y-6">
          <Section id="cobertura" number="01" title="Despachos y cobertura">
            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4">
              <p className="flex items-start gap-2 font-bold text-pink-800"><MapPin className="mt-1 h-5 w-5 shrink-0" /> Venta exclusivamente online y despacho a domicilio</p>
              <p className="mt-2">Boutique Pet Love realiza sus entregas exclusivamente mediante servicios de despacho (delivery). <strong>No contamos con tienda física, retiro en sucursal propia ni puntos de entrega o retiro para clientes.</strong></p>
            </div>
            <h3 className="font-bold text-gray-900">PAKET — $3.500 por pedido</h3>
            <p>Ofrecemos despacho mediante PAKET en la Región Metropolitana y en comunas con cobertura de las regiones de Valparaíso y O’Higgins. <strong>La cobertura en Valparaíso y O’Higgins se valida según la comuna de destino.</strong></p>
            <p>Si una comuna no tiene cobertura PAKET, contactaremos al cliente para ofrecer el despacho mediante Starken o Bluexpress, bajo modalidad por pagar. Informaremos y acordaremos previamente cualquier ajuste del costo de transporte, incluida la devolución de un cobro PAKET que no corresponda.</p>
            <h3 className="font-bold text-gray-900">Agencias de transporte — Envíos por pagar</h3>
            <p>Para las demás regiones y comunas sin cobertura PAKET, coordinamos el despacho con Starken o Bluexpress. El cliente paga el transporte de acuerdo con las tarifas y condiciones de la empresa seleccionada.</p>
            
          </Section>

          <Section id="horarios" number="02" title="Horarios y programación de despachos">
            <p>Para la programación habitual de PAKET, nuestro <strong>horario de corte es a las 22:00 horas de Chile</strong>. Los pedidos se programan según el día y la hora de compra, considerando los días habilitados para despacho y las fechas de cierre operativo.</p>
            <div className="rounded-2xl border border-pink-100 bg-pink-50/60 p-3 sm:p-4">
              <p className="mb-3 text-sm font-bold text-pink-900">Selecciona el día de compra y revisa cuándo se despacha tu pedido:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {schedule.map(({ day, before, after }) => (
                  <div key={day} className="min-w-0 rounded-xl border border-pink-100 bg-white p-3 shadow-sm">
                    <h3 className="mb-3 text-base font-black text-gray-900">Compra realizada el {day.toLowerCase()}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="min-w-0 rounded-lg bg-green-50 p-2.5">
                        <p className="text-xs font-semibold leading-5 text-gray-600">Antes de las 22:00</p>
                        <p className="mt-1 text-base font-black text-green-800">{before}</p>
                        <p className="mt-1 text-[11px] leading-4 text-gray-600">Despacho programado</p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-pink-50 p-2.5">
                        <p className="text-xs font-semibold leading-5 text-gray-600">Desde las 22:00</p>
                        <p className="mt-1 text-base font-black text-pink-800">{after}</p>
                        <p className="mt-1 text-[11px] leading-4 text-gray-600">Despacho programado</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p>Este calendario representa la programación habitual, <strong>siempre que los días indicados estén habilitados y no correspondan a feriados o cierres operativos</strong>. La fecha exacta se informa en el checkout según el calendario vigente.</p>
            <p>La <strong>fecha de despacho programado</strong> indica cuándo Boutique Pet Love entregará el pedido al transportista; <strong>no es la fecha de entrega al domicilio</strong>. Los plazos de transporte dependen del destino, la empresa y sus condiciones operativas. Los envíos por Starken o Bluexpress se coordinan según su operación.</p>
            <h3 className="font-bold text-gray-900">Información requerida para el envío</h3>
            <p>El cliente debe ingresar nombre y apellido, <strong>RUT</strong>, dirección completa y exacta, comuna, región, teléfono y correo electrónico. Es importante revisar que todos los datos sean correctos y completos para evitar retrasos o inconvenientes.</p>
            <p>Si es necesario gestionar un nuevo envío por datos erróneos proporcionados por el cliente, informaremos previamente los costos adicionales que correspondan. Esto no limita los derechos que la ley reconozca al consumidor.</p>
          </Section>

          <Section id="cambios" number="03" title="Cambios voluntarios de talla">
            <p>Aceptamos solicitudes de <strong>cambio voluntario de talla dentro de los 10 días corridos siguientes a la recepción del pedido</strong>, sujetas a disponibilidad de stock.</p>
            <p>La prenda debe encontrarse sin uso, limpia, sin manchas, pelos ni olores, sin daños ni modificaciones, y con etiquetas y accesorios originales cuando corresponda.</p>
            <h3 className="font-bold text-gray-900">Producto y temporada</h3>
            <p>El cambio voluntario se realiza por otra talla del mismo producto y <strong>debe mantenerse dentro de la temporada original de compra</strong>. No se aceptan cambios voluntarios entre temporadas; por ejemplo, una prenda de Fiestas Patrias no se cambia por una de Navidad.</p>
            <p>Si la nueva talla o prenda autorizada tiene un precio superior al originalmente pagado, se cobrará la diferencia, además de los costos de transporte aplicables al cambio voluntario.</p>
            <h3 className="font-bold text-gray-900">Costos de transporte por cambios voluntarios</h3>
            <p><strong>PAKET:</strong> el cliente asume el costo de despacho de la nueva prenda. La devolución de la prenda original se coordinará previamente y cualquier costo de ese traslado se informará y acordará antes de gestionarlo.</p>
            <p><strong>Starken o Bluexpress:</strong> el cliente asume el costo de devolver la prenda original a una sucursal de la agencia de transporte previamente acordada con Boutique Pet Love. Una vez recibida y revisada, la nueva prenda se enviará por pagar, a cargo del cliente.</p>
            <h3 className="font-bold text-gray-900">Errores atribuibles a Boutique Pet Love</h3>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p>Si enviamos por error una talla, modelo o producto distinto al comprado, <strong>Boutique Pet Love asumirá los costos de devolución o recuperación de la prenda incorrecta y el despacho de la prenda correcta</strong>, sin costo adicional para el cliente.</p>
              <p className="mt-2">Coordinaremos la solución en <strong>días hábiles de lunes a viernes</strong>, excluyendo feriados y cierres operativos, y programaremos la gestión para el siguiente día hábil disponible tras verificar el caso y la disponibilidad. No realizamos cambios presenciales los sábados, domingos ni feriados. La entrega final dependerá del transportista y del destino, sin perjuicio de los plazos y derechos legales aplicables.</p>
            </div>
          </Section>

          <Section id="devoluciones" number="04" title="Devoluciones, derecho a retracto y garantía legal">
            <h3 className="font-bold text-gray-900">Derecho a retracto en compras online — 10 días</h3>
            <p>En las compras realizadas por internet, el consumidor puede ejercer el <strong>derecho a retracto dentro de los 10 días siguientes a la recepción del producto</strong>, conforme a la Ley N.º 19.496 y sus condiciones y excepciones legales aplicables.</p>
            <p>Para solicitarlo, el cliente deberá contactarnos indicando su número de pedido y los productos que desea devolver. Informaremos las instrucciones para efectuar la devolución por transporte, ya que no disponemos de atención presencial ni puntos de retiro.</p>
            <p>Para ejercer el retracto, el cliente deberá devolver la prenda en las condiciones exigidas por la normativa aplicable. El cliente asumirá el costo directo del transporte de devolución cuando corresponda legalmente, utilizando el medio previamente coordinado con Boutique Pet Love.</p>
            <p>Una vez recibida la devolución, verificaremos su estado y gestionaremos la restitución del dinero conforme a los plazos y condiciones legales. Esta revisión no suspende ni restringe los derechos del consumidor. El derecho a retracto es independiente de nuestra política de cambios voluntarios de talla.</p>
            <h3 className="font-bold text-gray-900">Garantía legal</h3>
            <p>Si un producto nuevo presenta fallas o defectos cubiertos por la garantía legal, el consumidor dispone, por regla general, de <strong>seis meses desde su recepción</strong> para ejercer los derechos que establece la Ley del Consumidor, incluyendo las alternativas legales de reparación, cambio o devolución del dinero, según corresponda.</p>
            <p>La garantía legal cubre los defectos o fallas de origen que correspondan conforme a la ley; no cubre el desgaste normal ni los daños atribuibles al uso inadecuado, mordeduras, tirones o deterioro causado por la mascota, salvo que exista una falla legalmente cubierta.</p>
            <p>Las restricciones comerciales sobre temporadas, cambios voluntarios, plazos de 10 días y gastos de envío <strong>no limitan la garantía legal ni el derecho a retracto</strong>. Los errores de preparación o despacho atribuibles a Boutique Pet Love se resolverán sin cobrar al cliente los costos de su corrección.</p>
            <div className="rounded-2xl bg-pink-50 p-4">
              <p className="flex items-center gap-2 font-bold text-pink-800"><PackageCheck className="h-5 w-5" /> ¿Cómo solicitar un cambio o devolución?</p>
              <p className="mt-2">Escríbenos indicando número de pedido, producto, talla recibida, motivo de la solicitud y, si corresponde, fotografías que permitan identificar el inconveniente.</p>
              <a href="https://www.instagram.com/boutique_petlove/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700"><MessageCircle className="h-4 w-4" /> Contactar por Instagram</a>
            </div>
          </Section>
        </div>
        <p className="mt-8 text-center text-xs leading-6 text-gray-500">Estas políticas se interpretan conforme a la legislación chilena de protección de los derechos de los consumidores.</p>
      </div>
    </main>
  );
}
