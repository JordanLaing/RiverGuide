
import * as Am4charts from "@amcharts/amcharts4/charts";
import * as Am4core from "@amcharts/amcharts4/core";
import Am4themes_animated from "@amcharts/amcharts4/themes/animated";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Hidden from "@material-ui/core/Hidden";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import Moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { IState } from "../../reducers/index";
import { IExpansionPanels, IGauge, IHistory, IInfoPage, IObservable, IObsValue } from "../../utils/types";
import DataDropDown from "./DataDropDown";
import ExpansionHead from "./ExpansionHead";

Am4core.useTheme(Am4themes_animated);

interface IFlowChartStateProps {
    infoPage: IInfoPage;
    gauges: IGauge[];
    expansionPanels: IExpansionPanels;
}

interface IFlowChartProps extends IFlowChartStateProps {
    gaugeId: string;
}

interface IChartData {
    value: number;
    date: number;
}

interface IFlowChartState {
    selectedType?: string;
}

class FlowChart extends Component<IFlowChartProps, IFlowChartState> {
    constructor(props: IFlowChartProps) {
        super(props);
        let selectedType: string | undefined;
        const observables: IObservable[] | undefined = this.getObservables();
        if (observables) {
            const types: string[] = observables.map((item: IObservable): string => item.type);
            if (types.indexOf("flow") >= 0) {
                selectedType = "flow";
            } else if (types.length > 0) {
                selectedType = types[0];
            }
        }
        this.state = {
            selectedType,
        };
      }

    public getObservables = (): IObservable[] | undefined => {
        const observables: IObservable[] | undefined = this.props.infoPage.selectedGuide.observables;
        if (observables) {
            return observables;
        } else {
            const gauges: IGauge[] = this.props.gauges.filter(
                (item: IGauge) => item.id === this.props.infoPage.selectedGuide.gauge_id,
            );
            if (gauges.length > 0) {
                return gauges[0].observables;
            }
        }
        return undefined;
    }

    public mapHistory = (history: IHistory[]): IChartData[] => {
        const type: string = this.state.selectedType || "flow";
        const key: keyof IObsValue = type as keyof IObsValue;
        const result: IChartData[] = history.map((reading: IHistory): IChartData => {
            return {
                value: reading.values[key] || 0,
                date: Moment.utc(Moment(reading.time)).valueOf(),
            };
        });
        return result;
    }

    public getUnit = (): string => {
        let unit: string = "";
        const type: string = this.state.selectedType || "flow";
        const observables: IObservable[] | undefined = this.getObservables();
        if (observables) {
            const selObs: IObservable[] = observables.filter((item: IObservable) => (item.type === type));
            unit = selObs[0].units;
        }
        if (unit === "cumecs") {
            unit = "m\u00B3/s";
        }

        if (unit === "metres") {
            unit = "m";
        }

        if (unit === "litres_second") {
            unit = "l/s";
        }
        return unit;
    }

    public setChartOptions = (): void => {
        const chart: Am4charts.XYChart = Am4core.create("chartdiv", Am4charts.XYChart);

        chart.data = this.mapHistory(this.props.infoPage.history);
        const dateAxis: Am4charts.DateAxis = chart.xAxes.push(new Am4charts.DateAxis());
        // dateAxis.renderer.grid.template.location = 0.5;
        // dateAxis.renderer.minGridDistance = 50;
        dateAxis.baseInterval = {
            timeUnit: "minute",
            count: 1,
        };

        const valueAxis: Am4charts.ValueAxis = chart.yAxes.push(new Am4charts.ValueAxis());
        if (valueAxis.tooltip) {
            valueAxis.tooltip.disabled = true;
        }
        valueAxis.title.text = this.getUnit();

        const series: Am4charts.LineSeries = chart.series.push(new Am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "value";
        series.strokeWidth = 3;
        series.fillOpacity = 0.0;

        dateAxis.tooltipDateFormat = "dd MMM yyyy hh:mma";
        series.tooltipText = "{valueY.value}";
        chart.scrollbarX = new Am4core.Scrollbar();
        chart.scrollbarX.parent = chart.bottomAxesContainer;
    }

    public componentDidUpdate(nextProps: IFlowChartProps): void {
        if (this.props.expansionPanels.flowHistory) {
            this.setChartOptions();
        }
    }

    public handleTypeChange = (event: any): void => {
        this.setState({
            selectedType: event.target.value,
        });
    }

    public selectTypeClick(type: string): void {
        this.setState({
            selectedType: type,
        });
    }

    public getButtonColor(type: string): "inherit" | "primary" | "secondary" | "default" | undefined {
        if (type === this.state.selectedType) {
            return "primary";
        }
        return "default";
    }

    public getButtonVariant(type: string):
        "text" | "outlined" | "contained" | undefined {
        if (type === this.state.selectedType) {
            return "contained";
        }
        return "outlined";
    }

    public getFormSelect = (): JSX.Element | null => {
        const observables: IObservable[] | undefined = this.getObservables();
        if (observables) {
            return (
                <FormControl variant="outlined" style={{minWidth: "120px"}}>
                    <Select
                    value={this.state.selectedType}
                    onChange={this.handleTypeChange}
                    input={<OutlinedInput labelWidth={0} name="age" id="outlined-age-simple" />}
                    >
                        {observables.map((item: IObservable) =>
                        <MenuItem value={item.type}>{item.type.toUpperCase()}</MenuItem>)
                        }
                    </Select>
        </FormControl>
            );
        }
        return null;

    }

    public getButtons = (): JSX.Element[] | null => {
        const observables: IObservable[] | undefined = this.getObservables();
        if (observables) {
            const result: JSX.Element[] = observables.map((item: IObservable) =>
                <Hidden smDown>
                    <Button
                        style = {{marginLeft: "10px"}}
                        variant={this.getButtonVariant(item.type)}
                        color={this.getButtonColor(item.type)} key={item.type}
                        onClick = {(): void => this.selectTypeClick(item.type)}
                    >
                        {item.type}
                    </Button>
                </Hidden>,
            );
            result.push(
                <Hidden mdUp>
                    {this.getFormSelect()}
                </Hidden>,
            );
            result.push(<DataDropDown key = "data-drop-down"/>);
            return result;
        } else {
            return null;
        }
    }

    public render(): JSX.Element {
        const visible: boolean = this.props.expansionPanels.flowHistory;
        return (
            <div>
                <ExpansionHead title={"History"} panelName={"flowHistory"}/>
                {visible && <div className="flow-chart-buttons">
                    {this.getButtons()}
                </div>}
                {visible && <div id="chartdiv" style={{width: "100%", height: "300px"}}></div>}
            </div>
        );
    }
}

function mapStateToProps(state: IState): IFlowChartStateProps {
    return ({
        infoPage: state.infoPage,
        gauges: state.gauges,
        expansionPanels: state.expansionPanels,
    });
}

export default connect(mapStateToProps)(FlowChart);
