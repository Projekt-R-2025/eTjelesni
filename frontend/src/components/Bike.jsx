import Oglasnaploca from './Oglasnaploca'
import MapRoute from './MapRoute'

function Bike() {
    const [hoveredAd, setHoveredAd] = useState(null);

    return (
        <>
            <MapRoute hoveredAd={hoveredAd} />
            <Oglasnaploca onAdHover={setHoveredAd} />
        </>
    )
}

export default Bike