import {
    CheckOutlined,
    CodeOutlined,
    DisconnectOutlined,
    LinkOutlined,
    LoadingOutlined,
} from '@ant-design/icons'
import { Card, Col, Input, Row, Table, Tooltip } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { History } from 'history'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { IMobileComponent } from '../../models/ContainerProps'
import ClickableLink from '../global/ClickableLink'
import NewTabLink from '../global/NewTabLink'
import Timestamp from '../global/Timestamp'
import { IAppDef } from './AppDefinition'

type TableData = IAppDef & { lastDeployTime: string }

class AppsTable extends Component<
    {
        history: History
        apps: IAppDef[]
        rootDomain: string
        defaultNginxConfig: string
        isMobile: boolean
    },
    { searchTerm: string }
> {
    constructor(props: any) {
        super(props)
        this.state = { searchTerm: '' }
    }

    onAppClicked(appName: string) {
        this.props.history.push(`/apps/details/${appName}`)
    }

    createColumns(): ColumnProps<TableData>[] {
        const self = this
        const ALIGN: 'center' = 'center'
        return [
            {
                title: 'App Name',
                dataIndex: 'appName',
                key: 'appName',
                render: (appName: string) => (
                    <ClickableLink
                        onLinkClicked={() => self.onAppClicked(appName)}
                    >
                        {appName}
                    </ClickableLink>
                ),
                sorter: (a, b) => {
                    return a.appName
                        ? a.appName.localeCompare(b.appName || '')
                        : 0
                },
                defaultSortOrder: 'ascend',
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: 'Persistent Data	',
                dataIndex: 'hasPersistentData',
                key: 'hasPersistentData',
                align: ALIGN,
                render: (hasPersistentData: boolean) => {
                    if (!hasPersistentData) {
                        return <span />
                    }

                    return (
                        <span>
                            <CheckOutlined />
                        </span>
                    )
                },
            },
            {
                title: 'Instance Count',
                dataIndex: 'instanceCount',
                key: 'instanceCount',
                align: ALIGN,
            },
            {
                title: 'Last Deployed',
                dataIndex: 'lastDeployTime',
                key: 'lastDeployTime',
                align: ALIGN,
                sorter: (a, b) => {
                    return (
                        new Date(b.lastDeployTime).getTime() -
                        new Date(a.lastDeployTime).getTime()
                    )
                },
                render: (lastDeployTime: string, app) => {
                    if (!lastDeployTime) {
                        return <span />
                    }

                    return (
                        <span>
                            <Timestamp timestamp={lastDeployTime} />
                            {!!app.isAppBuilding ? (
                                <LoadingOutlined
                                    style={{
                                        fontSize: '12px',
                                        paddingLeft: 12,
                                    }}
                                />
                            ) : undefined}
                        </span>
                    )
                },
            },
            {
                title: 'Open',
                dataIndex: 'notExposeAsWebApp',
                key: 'openInBrowser',
                align: ALIGN,
                render: (notExposeAsWebApp: boolean, app) => {
                    if (notExposeAsWebApp) {
                        return (
                            <Tooltip title="Not exposed as a web app">
                                <DisconnectOutlined />
                            </Tooltip>
                        )
                    }

                    return (
                        <NewTabLink
                            url={`http${
                                app.hasDefaultSubDomainSsl ? 's' : ''
                            }://${app.appName}.${self.props.rootDomain}`}
                        >
                            <LinkOutlined />{' '}
                        </NewTabLink>
                    )
                },
            },
        ]
    }

    render() {
        const self = this

        const appsToRender = self.props.apps
            .filter((app) => {
                if (!self.state.searchTerm) return true

                return app.appName!.indexOf(self.state.searchTerm) >= 0
            })
            .map((app) => {
                const lastDeployTime =
                    app.versions.filter(
                        (v) => v.version === app.deployedVersion
                    )[0].timeStamp || ''
                return { ...app, lastDeployTime }
            })

        const searchAppInput = (
            <Input
                placeholder="Search by Name"
                type="text"
                onChange={(event) =>
                    self.setState({
                        searchTerm: (event.target.value || '').trim(),
                    })
                }
            />
        )

        return (
            <Row justify="center">
                <Col
                    xs={{ span: 23 }}
                    lg={{ span: 16 }}
                    style={{ paddingBottom: 300 }}
                >
                    <Card
                        extra={!self.props.isMobile && searchAppInput}
                        title={
                            <React.Fragment>
                                <span>
                                    <CodeOutlined />
                                    &nbsp;&nbsp;&nbsp;Your Apps
                                </span>
                                <br />
                                {self.props.isMobile && searchAppInput}
                            </React.Fragment>
                        }
                    >
                        <Row justify="center">
                            {self.props.isMobile ? (
                                appsToRender.map(
                                    ({
                                        appName = '',
                                        hasPersistentData,
                                        notExposeAsWebApp,
                                        instanceCount,
                                        hasDefaultSubDomainSsl,
                                    }) => (
                                        <Card
                                            type="inner"
                                            title={appName}
                                            key={appName}
                                            extra={
                                                <ClickableLink
                                                    onLinkClicked={() =>
                                                        self.onAppClicked(
                                                            appName
                                                        )
                                                    }
                                                >
                                                    Details
                                                </ClickableLink>
                                            }
                                        >
                                            <p>
                                                Persistent Data:{' '}
                                                {!hasPersistentData ? undefined : (
                                                    <span>
                                                        <CheckOutlined />
                                                    </span>
                                                )}
                                            </p>
                                            <p>
                                                Exposed Webapp:{' '}
                                                {!!notExposeAsWebApp ? undefined : (
                                                    <span>
                                                        <CheckOutlined />
                                                    </span>
                                                )}
                                            </p>
                                            <p>
                                                Instance Count: {instanceCount}
                                            </p>
                                            <p>
                                                Open in Browser:{' '}
                                                {!!notExposeAsWebApp ? undefined : (
                                                    <NewTabLink
                                                        url={`http${
                                                            hasDefaultSubDomainSsl
                                                                ? 's'
                                                                : ''
                                                        }://${appName}.${
                                                            self.props
                                                                .rootDomain
                                                        }`}
                                                    >
                                                        <LinkOutlined />{' '}
                                                    </NewTabLink>
                                                )}
                                            </p>
                                        </Card>
                                    )
                                )
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    <Table<TableData>
                                        rowKey="appName"
                                        columns={self.createColumns()}
                                        dataSource={appsToRender}
                                        pagination={false}
                                        size="middle"
                                    />
                                </div>
                            )}
                        </Row>
                    </Card>
                </Col>
            </Row>
        )
    }
}

function mapStateToProps(state: any) {
    return {
        isMobile: state.globalReducer.isMobile,
    }
}

export default connect<IMobileComponent, any, any>(
    mapStateToProps,
    undefined
)(AppsTable)
