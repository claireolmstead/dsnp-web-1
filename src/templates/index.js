import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import { Layout } from '../components/common'
import { MetaData } from '../components/common/meta'
import IndexPostCard from "../components/common/IndexPostCard"
import { Parallax, ParallaxProvider } from 'react-scroll-parallax'
import ClickDrag from "../images/ClickDrag.svg"
import ScrollContainer from 'react-indiana-drag-scroll'
import * as paper from 'paper'
import 'react-alice-carousel/lib/alice-carousel.css'
import { generateKey } from "../utils/keyGenerator"
import UpArrow from "../images/arrow-btn-dark.svg"

/**
* Main index page (home page)
*
* Shows intro information.
*
*/
const Index = ({ data, location }) => {
    const [isCustomCursor, setIsCustomCursor] = useState(false)
    const [isHoveringLink, setIsHoveringLink] = useState(false)

    const posts = data.allGhostPost.nodes

    const whatWeDo = posts.filter(post => post.tags.some(tag => tag.name === `#HomePageWhatWeDo`))
    const ecosystemCards = posts.filter(card => card.tags.some(tag => tag.name === `#HomePageEcosystemCard`))

    const cursorIconSettings = () => {
        let clientX = -100
        let clientY = -100
        const innerCursor = typeof document !== `undefined` ? document.querySelector(`.Index__cursor--small`) : null
        if (typeof document !== `undefined`) {
            document.addEventListener(`mousemove`, (e) => {
                clientX = e.clientX
                clientY = e.clientY
            })
        }
        const doRender = () => {
            innerCursor.style.transform = `translate(${clientX}px, ${clientY}px)`
            requestAnimationFrame(doRender)
        }
        requestAnimationFrame(doRender)

        let lastX = 0
        let lastY = 0
        let group
        const canvas = typeof document !== `undefined` ? document.querySelector(`.Index__cursor--canvas`) : null
        paper.setup(canvas)

        const myPathLeft = new paper.Path()
        myPathLeft.strokeColor = `#469abd`
        myPathLeft.strokeWidth = 2
        myPathLeft.add(new paper.Point(15, 15))
        myPathLeft.add(new paper.Point(0, 30))
        myPathLeft.add(new paper.Point(15, 45))

        const myCircle = new paper.Path.Circle(new paper.Point(57.5, 30), 30)
        myCircle.strokeColor = `#469abd`
        myCircle.strokeWidth = 2

        const myPathRight = new paper.Path()
        myPathRight.strokeColor = `#469abd`
        myPathRight.strokeWidth = 2
        myPathRight.add(new paper.Point(100, 15))
        myPathRight.add(new paper.Point(115, 30))
        myPathRight.add(new paper.Point(100, 45))

        const initCanvas = () => {
            group = new paper.Group([myPathLeft, myCircle, myPathRight])
            const lerp = (a, b, n) => (1 - n) * a + n * b
            paper.view.onFrame = () => {
                lastX = lerp(lastX, clientX, 0.2)
                lastY = lerp(lastY, clientY, 0.2)
                group.position = new paper.Point(lastX, lastY)
                if (isHoveringLink) {
                    group.strokeWidth = 3
                }
            }
        }

        initCanvas()

        const initHovers = () => {
            // find the center of the link element and set stuckX and stuckY
            // these are needed to set the position of the noisy circle
            const handleMouseEnter = () => {
                // const navItem = e.currentTarget
                // const navItemBox = navItem.getBoundingClientRect()
                setIsHoveringLink(true)
            }

            const handleMouseLeave = () => {
                // const navItem = e.currentTarget
                // const navItemBox = navItem.getBoundingClientRect()
                setIsHoveringLink(false)
            }

            // add event listeners to all items
            const linkItems = typeof document !== `undefined` ? document.querySelectorAll(`.hoverLink`) : null
            linkItems.forEach((item) => {
                item.addEventListener(`mouseenter`, handleMouseEnter)
                item.addEventListener(`mouseleave`, handleMouseLeave)
            })
        }

        initHovers()
    }

    useEffect(() => {
        if (isCustomCursor) {
            cursorIconSettings()
        }
    }, [isCustomCursor])

    return (
        <ParallaxProvider>
            <div className={!isCustomCursor ? `Index__block` : `Index__block Index__blockCustomCursor`}>
                {isCustomCursor &&
                    <>
                        <div className="Index__cursor Index__cursor--small"></div>
                        <canvas className="Index__cursor Index__cursor--canvas"></canvas>
                    </>
                }
                <MetaData location={location}/>
                <Layout isHome={true}>
                    <div className="container">
                        <div>
                            <section className="Index__banner" dangerouslySetInnerHTML={{ __html: whatWeDo[0].html }} />
                            <Link to="about-who-we-are">
                                <img className="Index__arrowButton" src={UpArrow} alt="up-arrow-button"/>
                            </Link>
                        </div>
                        <div className="Index__bodyBlock">
                            <div className="Index__PostCardBlockTitle" data-aos="fade-right" data-aos-duration="1400">
                                Get Started
                            </div>
                        </div>
                    </div>
                    <div onMouseEnter={() => setIsCustomCursor(true)} onMouseLeave={() => setIsCustomCursor(false)}>
                        <Parallax>
                            <ScrollContainer className="Index__postCardBlock" >
                                <img src={ClickDrag} alt="click-drag" className="Index__clickDragBlock" />
                                {ecosystemCards.map((cardData, index) => <IndexPostCard cardData={cardData} key={generateKey(cardData.title)} index={index + 1}/>)}
                            </ScrollContainer>
                        </Parallax>
                    </div>
                </Layout>
            </div>
        </ParallaxProvider>
    )
}

Index.propTypes = {
    data: PropTypes.shape({
        allGhostPost: PropTypes.object.isRequired,
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
}

export default Index

// This page query loads all posts sorted descending by published date
// The `limit` and `skip` values are used for pagination
export const pageQuery = graphql`
  query GhostIndexQuery {
    allGhostPost(filter: {tags: {elemMatch: {name: {in: ["#HomePage", "#HomePagePartners"]}}}}) {
        nodes {
            title
            html
            id
            tags {
                name
            }
            excerpt
        }
    }
  }
`
