import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useParams
} from 'react-router-dom'
import ReportPage from './ReportPage'
import HomePage from './HomePage'
import { QuestionOutlined, WarningOutlined } from '@ant-design/icons'
import Result from 'antd/es/result'
import { useSelector, useDispatch } from 'react-redux'
import { getEnv } from './actions'
import { getUsage } from './actions/usage'
import { AuthState } from '../proto/dekart_pb'

function AppRedirect () {
  const httpErrorStatus = useSelector(state => state.httpErrorStatus)
  const { newReportId } = useSelector(state => state.reportStatus)

  if (httpErrorStatus) {
    if (httpErrorStatus === 401) {
      const { REACT_APP_API_HOST } = process.env
      const req = new URL('/api/v1/authenticate', REACT_APP_API_HOST || window.location.href)
      const state = new AuthState()
      state.setAuthUrl(req.href)
      state.setUiUrl(window.location.href)
      state.setAction(AuthState.Action.ACTION_REQUEST_CODE)
      const stateBase64 = btoa(String.fromCharCode.apply(null, state.serializeBinary()))
      req.searchParams.set('state', stateBase64)
      window.location.href = req.href
      return null
    }
    return <Redirect to={`/${httpErrorStatus}`} />
  }

  if (newReportId) {
    return <Redirect to={`/reports/${newReportId}/source`} push />
  }

  return null
}

function RedirectToSource () {
  const { id } = useParams()
  return <Redirect to={`/reports/${id}/source`} />
}

export default function App () {
  const env = useSelector(state => state.env)
  const usage = useSelector(state => state.usage)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!env.loaded) {
      dispatch(getEnv())
    }
    if (!usage.loaded) {
      dispatch(getUsage())
    }
  })
  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <HomePage />
        </Route>
        <Route path='/reports/:id/edit'>
          <RedirectToSource />
        </Route>
        <Route path='/reports/:id/source'>
          <ReportPage edit />
        </Route>
        <Route path='/reports/:id'>
          <ReportPage />
        </Route>
        <Route path='/400'>
          <Result icon={<WarningOutlined />} title='400' subTitle='Bad Request' />
        </Route>
        <Route path='/401'>
          <Result icon={<WarningOutlined />} title='401' subTitle='Unauthorized' />
        </Route>
        <Route path='*'>
          <Result icon={<QuestionOutlined />} title='404' subTitle='Page not found' />
        </Route>
      </Switch>
      <AppRedirect />
    </Router>
  )
}
