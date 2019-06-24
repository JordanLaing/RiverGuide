import { TextField } from "@material-ui/core";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
    generateFilteredList,
    setSearchString,
} from "../../actions/actions";
import { IState } from "../../reducers/index";
import { IFilter, IListEntry, ILogEntry, IMapBounds } from "./../../utils/types";

interface ISearchBoxProps extends ISearchBoxStateToProps {
    generateFilteredList: (
        guides: IListEntry[] | ILogEntry[],
        searchString: string,
        mapBounds: IMapBounds) => void;
    setSearchString: (searchString: string) => void;
}

interface ISearchBoxStateToProps {
    mapBounds: IMapBounds;
    listEntries: IListEntry[];
    filters: IFilter;
    logs: ILogEntry[];
}

interface ISearchBoxState {
    value: string | null;
}

class SearchBox extends Component<ISearchBoxProps, ISearchBoxState> {
    constructor(props: ISearchBoxProps) {
        super(props);
        this.state = {
            value: null,
        };
    }

    public handleSearch = (event: any): void => {
        this.setState({
            value: event.target.value,
        });
        this.props.setSearchString(event.target.value || "");
        this.props.generateFilteredList(
            this.props.listEntries,
            event.target.value,
            this.props.mapBounds,
        );
    }
    public render(): JSX.Element {
        return (
            <TextField
                id="standard-search"
                className="search-field"
                color="white"
                label="Search"
                type="search"
                margin="normal"
                variant="outlined"
                onChange={this.handleSearch}
                inputProps={{ style: {height: "0.2em"} }}
                style={{
                    // width: "100%",
                    paddingBottom: ".5em",
                    color: "white",
                    // minWidth: "300px",
                    // height: "80%",
                }}
                value={this.props.filters.searchString}
                // value={this.state.value}
            />
        );
    }
}

const mapStateToProps: (state: IState) => ISearchBoxStateToProps = (state: IState): ISearchBoxStateToProps => ({
    listEntries: state.listEntries,
    mapBounds: state.mapBounds,
    filters: state.filters,
    logs: state.log,
});

export default connect(
    mapStateToProps,
    { generateFilteredList, setSearchString },
)(SearchBox);
