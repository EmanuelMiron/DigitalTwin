// Import Dependencies
import React from 'react';
import { useSelector } from 'react-redux';

// Import Reducers
import { selectLayerVisibility } from '../../reducers/layersData';
import { selectMapZoomLevel } from '../../reducers/map';

// Import Models
import { LocationType } from '../../models/locationsData';

// Import Helpers
import { getZoomByLocationType } from '../../helpers/locations';

// Import Styles
import './Legend.scss';

// Interfaces
interface LegendProps {
    layerId: string
    title: string;
    items: Record<string, string>;
    zoomThreshold?: number;
}

// Constants
const DEFAULT_ZOOM_THRESHOLD = getZoomByLocationType(LocationType.Floor);

// Create Legend Component
const Legend: React.FC<LegendProps> = ({
    layerId,
    title,
    items,
    zoomThreshold = DEFAULT_ZOOM_THRESHOLD,
}) => {

    // Get zoom level
    const zoomLevel = useSelector(selectMapZoomLevel);
    // Get if layer is visible
    const isLayerVisible = useSelector(selectLayerVisibility(layerId));

    // Check if legend is Visible
    const isLegendVisible = isLayerVisible && zoomLevel && zoomLevel >= zoomThreshold;
    if (!isLegendVisible) {
        return null;
    }

    // Return the jsx component
    return (
        <div className="legend-outer">
            <div className='my-legend'>
                <div className='legend-title'>
                    {title}
                </div>

                <div className='legend-scale'>
                    <ul className='legend-labels'>
                        {
                            Object.entries(items).map(([color, text]) => <li>
                                <span style={{ backgroundColor: color }}></span>
                                {text}
                            </li>
                            )
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Export the Lgend Component
export default Legend;
