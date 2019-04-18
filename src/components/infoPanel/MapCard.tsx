import React, { Component } from "react";

// Material UI
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

// Component
import { IMarker } from "../../utils/types";
import InfoMapComponent from "../map/InfoMapComponent";

interface IMapCardProps {
    markers: IMarker[];
}

class MapCard extends Component<IMapCardProps> {
    public render(): JSX.Element {
        return (
            <Card>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        Local map
                    </Typography>
                    <InfoMapComponent markers={this.props.markers} />
                </CardContent>
            </Card>
        );
    }
}

export default MapCard;
