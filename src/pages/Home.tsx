import { useEffect } from 'react'
import { Header } from '../components/home/Header'
import { Hero } from '../components/home/Hero'
import { Showreel } from '../components/home/Showreel'
import { Services } from '../components/home/Services'
import { Work } from '../components/home/Work'
import { QuoteForm } from '../components/home/QuoteForm'
import { Faq, Footer, MobileBar, Partners, Pricing, Process, Testimonials } from '../components/home/Sections'
import { QuoteProvider } from '../components/home/QuoteContext'
import { useAsync } from '../hooks/useAsync'
import { fetchCategories, fetchPublishedProjects } from '../lib/api'

export default function Home() {
  const projects = useAsync(fetchPublishedProjects)
  const categories = useAsync(fetchCategories)

  // Honor /#section links (also used by redirects from the old Framer pages)
  const ready = !projects.loading
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (ready && id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [ready])

  return (
    <QuoteProvider>
      <Header />
      <main>
        <Hero />
        <Showreel />
        <Partners />
        <Services projects={projects.data ?? []} />
        <Work
          projects={projects.data ?? []}
          categories={categories.data ?? []}
          loading={projects.loading && !projects.data}
        />
        <Pricing />
        <Process />
        <Testimonials />
        <Faq />
        <QuoteForm />
      </main>
      <Footer />
      <MobileBar />
    </QuoteProvider>
  )
}
