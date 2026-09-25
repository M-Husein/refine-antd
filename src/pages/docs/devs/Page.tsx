import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useGetIdentity } from "@refinedev/core";
import { 
  Anchor, Col, Row, 
  Button, Avatar, 
  Modal, Image, notification, message, 
  Dropdown, Select, AutoComplete, 
  Popover, Popconfirm, Tooltip, 
  DatePicker, TimePicker, ColorPicker
} from 'antd';
import { updateUser } from '@/utils/user';

// import { Icon } from './components/Icon';
import { CircleSteps } from './components/CircleSteps';

const sectionStyle = { minHeight: 'calc(100vh - 88px)' };

export default function Page(){
  useDocumentTitle("Devs");

  const identity = useGetIdentity(); // { data: identity }
  // console.log('identity:', identity);

  const [notifApi, notifHolder] = notification.useNotification();
  const [messageApi, messageHolder] = message.useMessage();

  const [modalOpen, setModalOpen] = useState(false);
  const [color, setColor] = useState('');

  const openNotification = (placement: any) => { // NotificationPlacement
    notifApi.info({
      title: `Notification ${placement}`,
      description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
      placement,
    });
  };

  return (
    <>
      {/* @ts-ignore */}
      {/* {UNDEFINED} */}

      {/* <h1>Devs</h1> */}
      <Row className="lg_-m-4 -m-2">
        <Col span={20} className="p-4">
          <div 
            id="updateUser" 
            style={sectionStyle}
          >
            <Button
              type="primary"
              onClick={() => {
                updateUser({ avatar: '1_019f0e4c-08f6-7365-be83-74b08057ba64.png' });
                identity.refetch();
              }}
            >
              updateUser
            </Button>
            {' '}
            <Avatar
              alt="👤"
              src={identity?.data?.avatar}
              icon={<>👤</>}
              size={72}
            />

            {identity?.data && (
              <details open className="group mt-6 border rounded shadow">
                <summary className="py-1 px-3 hover_bg-blue-100 group-open_border-b">
                  User data:
                </summary>
                <pre className="mb-0 p-2 bg-white">{JSON.stringify(identity.data, null, 2)}</pre>
              </details>
            )}
          </div>

          <div 
            id="i18n" 
            style={sectionStyle}
          >
            <h2>Test i18n & components with popup</h2>
            <div className="flex flex-wrap gap-1">
              <DatePicker />

              <TimePicker 
                // onChange={onChange} 
                // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')} 
              />
              
              <Dropdown 
                trigger={['click']}
                menu={{
                  items: [
                    {
                      label: (
                        <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
                          1st menu item
                        </a>
                      ),
                      key: '1',
                    },
                    {
                      type: 'divider',
                    },
                    {
                      label: '2rd menu item',
                      key: '2',
                    },
                  ]
                }}
              >
                <Button>
                  Show Dropdown
                </Button>
              </Dropdown>
              
              <Select
                showSearch // ={{ optionFilterProp: 'label', onSearch }}
                placeholder="Select a person"
                options={[
                  {
                    value: 'jack',
                    label: 'Jack',
                  },
                  {
                    value: 'lucy',
                    label: 'Lucy',
                  },
                  {
                    value: 'tom',
                    label: 'Tom',
                  },
                ]}
              />

              <AutoComplete
                options={[
                  { value: 'Muhammad Husein' },
                  { value: 'Muhammad Danish Ali' }
                ]}
                style={{ width: 175 }}
                placeholder="AutoComplete"
              />
              
              <Popover 
                trigger="click"
                title="Popover title"
                content={
                  <>
                    <p>Content</p>
                  </>
                }
              >
                <Button type="primary">Show Popover</Button>
              </Popover>
              
              <Popconfirm
                title="Delete the task"
                description="Are you sure to delete this task?"
                onConfirm={() => messageApi.success('Click on Yes')}
                onCancel={() => messageApi.error('Click on No')}
                okText="Yes"
                cancelText="No"
              >
                <Button danger>Show Popconfirm</Button>
              </Popconfirm>
              
              <Tooltip 
                // trigger="click"
                // align={{
                //   // offset: [0, 48], // the offset sourceNode by 10px in x and 20px in y,
                //   targetOffset: [0, 48], // the offset targetNode by 30% of targetNode width in x and 40% of targetNode height in y,
                // }}
                title="Prompt text"
              >
                <Button>Show Tooltip</Button>
              </Tooltip>

              <ColorPicker 
                showText 
                allowClear
                value={color}
                onChange={(_val, css) => setColor(css)}
              />
            </div>

            <hr />

            <Button
              onClick={() => setModalOpen(true)}
            >
              Open Modal
            </Button>
            {' '}
            <Image
              width={99}
              alt="basic"
              src="/logo-144x144.png"
            />
            {' '}
            <Image
              width={200}
              alt="basic image"
              preview={{
                imageRender: () => (
                  // <video
                  //   muted
                  //   width="100%"
                  //   controls
                  //   src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ"
                  // />
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.514996914901!2d106.7083118747515!3d-6.327244293662274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69e568bc9d2bd7%3A0x8030bb1eb71acc12!2sPamulang%20Permai%202%2C%20Jl.%20Benda%20Timur%20XI%2C%20Benda%20Baru%2C%20Kec.%20Pamulang%2C%20Kota%20Tangerang%20Selatan%2C%20Banten%2015415!5e0!3m2!1sen!2sid!4v1784920202679!5m2!1sen!2sid" 
                    width={600} 
                    height={450} 
                    // style="border:0;" 
                    allowFullScreen
                    loading="lazy" 
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ),
                actionsRender: () => null,
              }}
              src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            />

            <hr />

            <h2>Notification</h2>
            <div className="flex flex-wrap gap-1">
              {[
                'top', 
                'bottom', 
                'topLeft', 
                'topRight', 
                'bottomLeft', 
                'bottomRight'
              ].map(item => 
                <Button
                  key={item}
                  onClick={() => openNotification(item)}
                >
                  {item}
                </Button>
              )}
            </div>

            <hr />

            <h2>Message</h2>
            <Button 
              onClick={() => {
                messageApi.open({
                  type: 'loading',
                  content: 'Action in progress..',
                  duration: 0,
                });
                // Dismiss manually and asynchronously
                setTimeout(messageApi.destroy, 2500);
              }}
            >
              Display a loading indicator
            </Button>
            {' '}
            <Button 
              onClick={() => {
                messageApi.open({
                  type: 'loading',
                  content: 'Action in progress..',
                  duration: 2.5,
                })
                .then(() => messageApi.success('Loading finished', 2.5))
                .then(() => messageApi.info('Loading finished', 2.5));
              }}
            >
              Display sequential messages
            </Button>
            
            <Modal
              title="Test Modal"
              open={modalOpen}
              onCancel={() => setModalOpen(false)}
            >
              <p>Modal content</p>
            </Modal>
          </div>

          <div 
            id="part-3" 
            style={sectionStyle}
          >
            <h2>{'<CircleSteps />'}</h2>
            <Col lg={3} md={11} sm={15} xs={24}>
              <CircleSteps
                // className="bg-black"
                // id="myCircleSteps"
                // aria-label="Circle Steps"
                // inert=""
                gap={1}
                // itemsColor="#2B85FF"
                items={[
                  { id: '1', label: '1', title: 'Step One' },
                  { id: '2', label: '2', title: 'Step Two' },
                  { id: '3', label: '3', title: 'Step Three' },
                  { id: '4', label: '4', title: 'Step Four' },
                  { id: '5', label: '5', title: 'Step Five' },
                  { id: '6', label: '6', title: 'Step Six' },
                  { id: '7', label: '7', title: 'Step Seven' },
                  { id: '8', label: '8', title: 'Step Eight' },
                  { id: '9', label: '9', title: 'Step Nine' },
                ]}
                // items={[
                //   { id: '1', label: '1', title: 'Step One', color: '#2B85FF' },
                //   { id: '2', label: '2', title: 'Step Two', color: '#14D0CA' },
                //   { id: '3', label: '3', title: 'Step Three', color: '#EFA062' },
                //   { id: '4', label: '4', title: 'Step Four', color: '#DC89FF' },
                //   { id: '5', label: '5', title: 'Step Five', color: '#8062FF' },
                //   { id: '6', label: '6', title: 'Step Six', color: '#6BD543' },
                //   { id: '7', label: '7', title: 'Step Seven', color: '#C49A33' },
                //   { id: '8', label: '8', title: 'Step Eight', color: '#FF83CF' },
                //   { id: '9', label: '9', title: 'Step Nine', color: '#309BB9' },
                // ]}
                content={<b style={{ fontSize: '500%' }}>75%</b>}
                // content={
                //   <>
                //     <div>AntV</div>
                //     <div>Charts</div>
                //   </>
                // }
                // content={
                //   <Button
                //   >
                //     Save
                //   </Button>
                // }
              />
            </Col>
          </div>
        </Col>

        <Col span={4}>
          <Anchor
            // affix
            offsetTop={48}
            items={[
              {
                key: 'updateUser',
                href: '#updateUser',
                title: 'updateUser',
              },
              {
                key: 'i18n',
                href: '#i18n',
                title: 'i18n',
              },
              {
                key: 'part-3',
                href: '#part-3',
                title: 'Part 3',
              },
            ]}
          />
        </Col>
      </Row>

      {notifHolder}
      {messageHolder}
    </>
  );
}
