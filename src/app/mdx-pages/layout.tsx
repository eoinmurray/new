export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 prose">
      {children}
    </div>
  )
}